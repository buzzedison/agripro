'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Play, ExternalLink, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { extractUrls } from '../../components/LinkPreview';
import { postMedia, PostMediaFields } from '@/lib/feed-media';

// Video URL detection helpers
export function isVideoUrl(url: string): boolean {
    if (!url) return false;
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i;
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/i;
    return videoExtensions.test(url) || youtubeRegex.test(url) || vimeoRegex.test(url);
}

function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' | null {
    if (!url) return null;
    if (/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(url)) return 'youtube';
    if (/vimeo\.com/i.test(url)) return 'vimeo';
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'direct';
    return null;
}

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
}

// Extract video URL from post content
export function extractVideoUrl(content: string): string | null {
    const urls = extractUrls(content);
    for (const url of urls) {
        if (isVideoUrl(url)) return url;
    }
    return null;
}

// Inline Video Player Component
export function InlineVideoPlayer({ url }: { url: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoType = getVideoType(url);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    if (videoType === 'youtube') {
        const videoId = getYouTubeId(url);
        if (!videoId) return null;

        return (
            <div className="relative rounded-xl overflow-hidden mb-3 bg-black group">
                <div className="relative aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open on YouTube
                </a>
            </div>
        );
    }

    if (videoType === 'vimeo') {
        const videoId = getVimeoId(url);
        if (!videoId) return null;

        return (
            <div className="relative rounded-xl overflow-hidden mb-3 bg-black group">
                <div className="relative aspect-video">
                    <iframe
                        src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
                        title="Vimeo video"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open on Vimeo
                </a>
            </div>
        );
    }

    if (videoType === 'direct') {
        return (
            <div className="relative rounded-xl overflow-hidden mb-3 bg-black group">
                <video
                    ref={videoRef}
                    src={url}
                    className="w-full max-h-[500px] object-contain"
                    muted={isMuted}
                    playsInline
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={handlePlayPause}
                />

                {/* Play overlay when paused */}
                {!isPlaying && (
                    <button
                        onClick={handlePlayPause}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                    </button>
                )}

                {/* Controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePlayPause}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            >
                                {isPlaying ? (
                                    <span className="text-sm font-bold">❚❚</span>
                                ) : (
                                    <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                                )}
                            </button>
                            <button
                                onClick={toggleMute}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        </div>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-white text-xs font-medium hover:underline"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open video
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

interface ResilientImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    fallbackText?: string;
}

export function ResilientImage({ src, alt, className = '', fallbackText = 'Media unavailable' }: ResilientImageProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-500 text-xs gap-2`}>
                <ImageIcon className="w-4 h-4" />
                <span>{fallbackText}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}

/** Uploaded post media: one video, or a grid of up to four photos with their alt text. */
export function PostMediaGallery({ post, className = 'mb-3' }: { post: PostMediaFields; className?: string }) {
    const items = postMedia(post);
    if (items.length === 0) return null;
    if (items.length === 1 && isVideoUrl(items[0].url)) {
        return <div className={className}><InlineVideoPlayer url={items[0].url} /></div>;
    }
    const grid = items.length === 1 ? 'grid-cols-1' : 'grid-cols-2';
    return (
        <div className={`grid ${grid} gap-1 overflow-hidden rounded-xl bg-gray-100 ${className}`}>
            {items.map((item, i) => (
                <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={items.length === 3 && i === 0 ? 'row-span-2' : ''}
                >
                    <ResilientImage
                        src={item.url}
                        alt={item.alt || (items.length > 1 ? `Post photo ${i + 1} of ${items.length}` : 'Post photo')}
                        className={`w-full object-cover ${items.length === 1 ? 'max-h-[500px]' : items.length === 3 && i === 0 ? 'h-full min-h-[16rem]' : 'h-32 sm:h-48'}`}
                    />
                </a>
            ))}
        </div>
    );
}
