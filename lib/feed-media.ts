import type { SupabaseClient } from '@supabase/supabase-js';

export const MAX_POST_PHOTOS = 4;
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // before compression
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // matches the post-images bucket limit
export const MAX_ALT_LENGTH = 300;
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MEDIA_BUCKET = 'post-images';

export type ComposerMedia = {
    id: string;
    file: File;
    kind: 'image' | 'video';
    previewUrl: string;
    alt: string;
};

export type PostMediaFields = { media_urls?: string[] | null; media_alt?: string[] | null; image_url?: string | null };

/** Media for display: media_urls when present, otherwise the legacy single image_url. */
export function postMedia(post: PostMediaFields): { url: string; alt: string }[] {
    const urls = post.media_urls?.length ? post.media_urls : post.image_url ? [post.image_url] : [];
    return urls.map((url, i) => ({ url, alt: post.media_alt?.[i]?.trim() || '' }));
}

/** Adds picked files to the composer, enforcing: up to 4 photos, or exactly one video, never both. */
export function addComposerFiles(current: ComposerMedia[], files: File[]): { media: ComposerMedia[]; error?: string } {
    let media = [...current];
    for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        if (!isVideo && !isImage) return { media, error: `${file.name} is not a photo or video.` };
        if (isVideo) {
            if (!VIDEO_TYPES.includes(file.type)) return { media, error: 'Videos must be MP4, WebM or MOV.' };
            if (file.size > MAX_VIDEO_BYTES) return { media, error: 'Videos must be 50 MB or smaller. Try a shorter clip.' };
            if (media.length > 0) return { media, error: 'A post can have one video, or up to four photos — not both.' };
        } else {
            if (file.size > MAX_PHOTO_BYTES) return { media, error: `${file.name} is larger than 15 MB.` };
            if (media.some(m => m.kind === 'video')) return { media, error: 'A post can have one video, or up to four photos — not both.' };
            if (media.length >= MAX_POST_PHOTOS) return { media, error: `You can add up to ${MAX_POST_PHOTOS} photos.` };
        }
        media = [...media, {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
            kind: isVideo ? 'video' : 'image',
            previewUrl: URL.createObjectURL(file),
            alt: '',
        }];
    }
    return { media };
}

export function releaseComposerMedia(media: ComposerMedia[]) {
    media.forEach(m => URL.revokeObjectURL(m.previewUrl));
}

/**
 * Shrinks a photo to at most 1600px on its longest side as JPEG, so posting works on
 * mobile data. GIFs keep their animation; anything the browser cannot decode is sent as-is.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.8): Promise<File> {
    if (file.type === 'image/gif' || typeof createImageBitmap === 'undefined') return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    } catch {
        return file;
    }
}

/**
 * Uploads every item or none: if any upload fails, the files already uploaded are
 * removed and an error is thrown, so a post is never published with missing media.
 */
export async function uploadPostMedia(
    supabase: SupabaseClient,
    userId: string,
    media: ComposerMedia[],
    onProgress?: (message: string) => void,
): Promise<{ urls: string[]; alts: string[] }> {
    const uploadedPaths: string[] = [];
    const urls: string[] = [];
    try {
        for (const [index, item] of media.entries()) {
            const label = media.length > 1 ? ` ${index + 1} of ${media.length}` : '';
            onProgress?.(item.kind === 'video' ? 'Uploading video…' : `Preparing photo${label}…`);
            const file = item.kind === 'image' ? await compressImage(item.file) : item.file;
            onProgress?.(item.kind === 'video' ? 'Uploading video…' : `Uploading photo${label}…`);
            const ext = file.name.split('.').pop()?.toLowerCase() || (item.kind === 'video' ? 'mp4' : 'jpg');
            const path = `${userId}/${Date.now()}-${index}.${ext}`;
            const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type });
            if (error) throw new Error(error.message);
            uploadedPaths.push(path);
            urls.push(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
        }
    } catch (err: any) {
        if (uploadedPaths.length) await supabase.storage.from(MEDIA_BUCKET).remove(uploadedPaths);
        throw new Error(`Upload failed${err?.message ? `: ${err.message}` : ''}. Your post was not published — check your connection and try again.`);
    }
    return { urls, alts: media.map(m => m.alt.trim().slice(0, MAX_ALT_LENGTH)) };
}

export async function removeUploadedMedia(supabase: SupabaseClient, urls: string[]) {
    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const paths = urls.map(u => u.split(marker)[1]).filter(Boolean);
    if (paths.length) await supabase.storage.from(MEDIA_BUCKET).remove(paths);
}
