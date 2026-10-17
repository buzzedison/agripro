'use client';

import { X } from 'lucide-react';
import { ComposerMedia, MAX_ALT_LENGTH } from '@/lib/feed-media';

type Props = {
    media: ComposerMedia[];
    onRemove: (id: string) => void;
    onAltChange: (id: string, alt: string) => void;
    disabled?: boolean;
};

/** Previews of photos/video picked in the composer, each with an optional description for screen readers. */
export default function ComposerMediaPreview({ media, onRemove, onAltChange, disabled }: Props) {
    if (media.length === 0) return null;
    return (
        <div className={`mt-2 mb-3 grid gap-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {media.map((item, i) => (
                <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-1.5">
                    <div className="relative">
                        {item.kind === 'video' ? (
                            <video src={item.previewUrl} controls muted className="w-full max-h-80 rounded-lg bg-black" />
                        ) : (
                            <img
                                src={item.previewUrl}
                                alt={item.alt || `Selected photo ${i + 1}`}
                                className={`w-full rounded-lg object-cover ${media.length > 1 ? 'h-36' : 'max-h-80'}`}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            disabled={disabled}
                            aria-label={`Remove ${item.kind === 'video' ? 'video' : `photo ${i + 1}`}`}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {item.kind === 'image' && (
                        <input
                            type="text"
                            value={item.alt}
                            maxLength={MAX_ALT_LENGTH}
                            disabled={disabled}
                            onChange={e => onAltChange(item.id, e.target.value)}
                            placeholder="Describe this photo (optional)"
                            aria-label={`Description for photo ${i + 1}`}
                            className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-green-500 focus:outline-none"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
