'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../lib/client'; // Adjusted path to client
import { urlForImage } from '@/lib/image';
import KnowledgeHubNavbar from '../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../components/KnowledgeHubFooter';
import { PlayCircle, Tag, Clock } from 'lucide-react';

interface Video {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  videoUrl: string;
  thumbnail: any; // Sanity image asset
  duration?: string;
  category: string;
  tags?: string[];
  presenter?: string;
  publishedAt: string;
}

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setIsLoading(true);
        setError(null);
        const query = `*[_type == "video"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          description,
          videoUrl,
          thumbnail,
          duration,
          category,
          tags,
          presenter,
          publishedAt
        }`;
        const fetchedVideos = await client.fetch<Video[]>(query);
        setVideos(fetchedVideos);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchVideos();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Loading Videos...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <KnowledgeHubNavbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Knowledge Hub Videos</h1>
        <p className="text-lg text-gray-600 mb-10">Explore our collection of informative videos covering various agricultural topics.</p>
        
        {videos.length === 0 ? (
          <div className="text-center py-10">
            <PlayCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Videos Available Yet</h3>
            <p className="text-gray-500">Check back soon for new video content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <Link href={`/knowledgehub/videos/${video.slug.current}`} key={video._id}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col h-full">
                  <div className="relative w-full h-48">
                    {video.thumbnail ? (
                      <Image 
                        src={urlForImage(video.thumbnail).url()} 
                        alt={video.title} 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <PlayCircle size={48} className="text-gray-400" />
                      </div>
                    )}
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-green-700 mb-2 leading-tight hover:text-green-600 transition-colors">{video.title}</h3>
                    {video.category && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Tag size={14} className="mr-1 text-green-500" />
                        <span>{video.category.charAt(0).toUpperCase() + video.category.slice(1).replace(/-/g, ' ')}</span>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{video.description || 'No description available.'}</p>
                    <div className="mt-auto pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-400">Published: {new Date(video.publishedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <KnowledgeHubFooter />
    </div>
  );
};

export default VideosPage;
