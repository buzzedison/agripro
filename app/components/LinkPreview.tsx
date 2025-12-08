'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Globe, Play, Youtube } from 'lucide-react';

interface LinkPreviewData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
}

interface LinkPreviewProps {
    url: string;
}

// Extract URLs from text
export function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    return text.match(urlRegex) || [];
}

// Parse content and wrap URLs in links
export function parseContentWithLinks(content: string): React.ReactNode {
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            // Reset regex lastIndex
            urlRegex.lastIndex = 0;
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 hover:underline break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}

// Check if URL is a video platform
function getVideoInfo(url: string): { type: 'youtube' | 'vimeo' | 'tiktok' | null; videoId: string | null } {
    try {
        const parsedUrl = new URL(url);

        // YouTube
        if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
            let videoId = null;
            if (parsedUrl.hostname.includes('youtu.be')) {
                videoId = parsedUrl.pathname.slice(1);
            } else if (parsedUrl.pathname.includes('/watch')) {
                videoId = parsedUrl.searchParams.get('v');
            } else if (parsedUrl.pathname.includes('/shorts/')) {
                videoId = parsedUrl.pathname.split('/shorts/')[1];
            } else if (parsedUrl.pathname.includes('/embed/')) {
                videoId = parsedUrl.pathname.split('/embed/')[1];
            }
            if (videoId) {
                return { type: 'youtube', videoId };
            }
        }

        // Vimeo
        if (parsedUrl.hostname.includes('vimeo.com')) {
            const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
            if (videoId && /^\d+$/.test(videoId)) {
                return { type: 'vimeo', videoId };
            }
        }

        // TikTok
        if (parsedUrl.hostname.includes('tiktok.com')) {
            const match = parsedUrl.pathname.match(/\/video\/(\d+)/);
            if (match) {
                return { type: 'tiktok', videoId: match[1] };
            }
        }

        return { type: null, videoId: null };
    } catch {
        return { type: null, videoId: null };
    }
}

// Video Embed Component
function VideoEmbed({ url, type, videoId }: { url: string; type: 'youtube' | 'vimeo' | 'tiktok'; videoId: string }) {
    const [isPlaying, setIsPlaying] = useState(false);

    const getEmbedUrl = () => {
        switch (type) {
            case 'youtube':
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            case 'vimeo':
                return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
            case 'tiktok':
                return `https://www.tiktok.com/embed/v2/${videoId}`;
            default:
                return '';
        }
    };

    const getThumbnail = () => {
        if (type === 'youtube') {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        return null;
    };

    const platformIcon = type === 'youtube' ? Youtube : Play;
    const PlatformIcon = platformIcon;

    return (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-black">
            {!isPlaying ? (
                <div
                    className="relative aspect-video cursor-pointer group"
                    onClick={() => setIsPlaying(true)}
                >
                    {getThumbnail() && (
                        <img
                            src={getThumbnail()!}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback to lower quality thumbnail
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            }}
                        />
                    )}
                    {!getThumbnail() && (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <PlatformIcon className="w-16 h-16 text-gray-600" />
                        </div>
                    )}

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </div>

                    {/* Platform badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-lg">
                        <PlatformIcon className="w-4 h-4" />
                        <span className="capitalize">{type}</span>
                    </div>
                </div>
            ) : (
                <div className="relative aspect-video">
                    <iframe
                        src={getEmbedUrl()}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}

            {/* Open externally link */}
            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-400 truncate flex-1 mr-4">
                    {url}
                </span>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-300 hover:text-white transition-colors flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="w-3 h-3" />
                    Open
                </a>
            </div>
        </div>
    );
}

export default function LinkPreview({ url }: LinkPreviewProps) {
    const [preview, setPreview] = useState<LinkPreviewData | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if it's a video URL
    const videoInfo = getVideoInfo(url);

    useEffect(() => {
        // Skip fetching preview for video URLs
        if (videoInfo.type && videoInfo.videoId) {
            setLoading(false);
            return;
        }

        const fetchPreview = async () => {
            try {
                setLoading(true);

                const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch preview');
                }

                const data = await response.json();
                setPreview(data);
            } catch (err) {
                console.error('Error fetching link preview:', err);
                setPreview({
                    url,
                    title: new URL(url).hostname,
                    siteName: new URL(url).hostname,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [url, videoInfo.type, videoInfo.videoId]);

    // If it's a video, render the video embed instead
    if (videoInfo.type && videoInfo.videoId) {
        return <VideoEmbed url={url} type={videoInfo.type} videoId={videoInfo.videoId} />;
    }

    if (loading) {
        return (
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 animate-pulse">
                <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!preview) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors overflow-hidden group"
        >
            {preview.image && (
                <div className="relative w-full h-48 bg-gray-100">
                    <img
                        src={preview.image}
                        alt={preview.title || 'Link preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    {preview.favicon ? (
                        <img src={preview.favicon} alt="" className="w-4 h-4 rounded" />
                    ) : (
                        <Globe className="w-4 h-4" />
                    )}
                    <span className="truncate">{preview.siteName || new URL(url).hostname}</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {preview.title && (
                    <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                        {preview.title}
                    </h4>
                )}
                {preview.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {preview.description}
                    </p>
                )}
            </div>
        </a>
    );
}
