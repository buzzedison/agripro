"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, AlertTriangle } from 'lucide-react';

interface GifPickerProps {
    onSelect: (gifUrl: string) => void;
    onClose: () => void;
}

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

// Mock GIFs for fallback
const MOCK_GIFS = [
    { id: '1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZpbXJ4ZnpmMXJ4ZnpmMXJ4ZnpmMXJ4ZnpmMXJ4Znp/3o7TKSjRrfIPjeiVyM/giphy.gif', title: 'Happy' },
    { id: '2', url: 'https://media.giphy.com/media/l0HlHJGHe3yAMhdQY/giphy.gif', title: 'Thumbs Up' },
    { id: '3', url: 'https://media.giphy.com/media/3o6UB3VhArvomJHtdK/giphy.gif', title: 'Party' },
    { id: '4', url: 'https://media.giphy.com/media/l0Ex9WXEmresJemaI/giphy.gif', title: 'Dance' },
    { id: '5', url: 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif', title: 'Laugh' },
    { id: '6', url: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', title: 'Wow' },
    { id: '7', url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif', title: 'Success' },
    { id: '8', url: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif', title: 'Celebrate' },
];

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [gifs, setGifs] = useState<{ id: string; url: string; title: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchGifs = async (query: string = '') => {
        setLoading(true);
        setError(null);

        if (!GIPHY_API_KEY) {
            console.warn('GIPHY API key is missing. Using mock data.');
            setGifs(MOCK_GIFS);
            setLoading(false);
            return;
        }

        try {
            const endpoint = query
                ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
                : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.meta && data.meta.status !== 200) {
                throw new Error(data.meta.msg || 'Failed to fetch GIFs');
            }

            const formattedGifs = data.data.map((gif: any) => ({
                id: gif.id,
                url: gif.images.original.url, // Using original for better quality, consider fixed_height for performance
                title: gif.title
            }));

            setGifs(formattedGifs);
        } catch (err: any) {
            console.error('Error fetching GIFs:', err);
            setError('Failed to load GIFs. Showing offline selection.');
            setGifs(MOCK_GIFS);
        } finally {
            setLoading(false);
        }
    };

    // Initial load (trending)
    useEffect(() => {
        fetchGifs();
    }, []);

    const handleSearch = (query: string) => {
        setSearch(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchGifs(query);
        }, 500); // Debounce search
    };

    return (
        <div className="absolute top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search GIFs via GIPHY..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                />
            </div>

            {error && (
                <div className="mb-2 px-2 py-1 bg-red-50 text-red-600 text-xs rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {error}
                </div>
            )}

            <div className="h-64 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {gifs.map((gif) => (
                            <button
                                key={gif.id}
                                onClick={() => {
                                    onSelect(gif.url);
                                    onClose();
                                }}
                                className="relative aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity bg-gray-100"
                            >
                                <img
                                    src={gif.url}
                                    alt={gif.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-2 flex justify-end">
                <img src="/giphy_logo.png" alt="Powered by GIPHY" className="h-3 opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
        </div>
    );
}
