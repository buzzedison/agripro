'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../../lib/client';
import { urlForImage } from '@/lib/image';
import KnowledgeHubNavbar from '../../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../../components/KnowledgeHubFooter';
import { ArrowLeft, Tag, Clock, Calendar, User } from 'lucide-react';

interface Video {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  videoUrl: string;
  thumbnail: any;
  duration?: string;
  category: string;
  tags?: string[];
  presenter?: string;
  publishedAt: string;
}

const VideoDetailPage = () => {
  const params = useParams();
  const { slug } = params;
  
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const query = `*[_type == "video" && slug.current == $slug][0] {
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
        const fetchedVideo = await client.fetch<Video>(query, { slug });
        
        if (!fetchedVideo) {
          setError('Video not found');
          return;
        }
        
        setVideo(fetchedVideo);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchVideo();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link
              href="/knowledgehub/videos"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Link>
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
            <h2 className="text-2xl font-bold text-green-600 mb-4">Loading Video...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Video Not Found</h2>
            <p className="text-gray-700 mb-6">The video you are looking for does not exist or has been removed.</p>
            <Link
              href="/knowledgehub/videos"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Link>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  // Function to render the embedded video
  const renderVideoEmbed = () => {
    const videoUrl = video.videoUrl;
    
    // YouTube embed
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = videoUrl.match(youtubeRegex);
      const videoId = match && match[1];
      
      if (videoId) {
        return (
          <div className="w-full aspect-video"> {/* Styling moved to parent */}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        );
      }
    }
    
    // Vimeo embed
    if (videoUrl.includes('vimeo.com')) {
      const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|)(\d+)(?:|\/\?)/;
      const match = videoUrl.match(vimeoRegex);
      const videoId = match && match[1];
      
      if (videoId) {
        return (
          <div className="w-full aspect-video"> {/* Styling moved to parent */}
            <iframe
              src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
              title={video.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        );
      }
    }
    
    // Default: direct video URL (mp4, etc.)
    return (
      <div className="w-full aspect-video"> {/* Styling moved to parent */}
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full" /* Changed from object-cover */
          poster={video.thumbnail ? urlForImage(video.thumbnail).url() : undefined}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <KnowledgeHubNavbar />
      
      {/* Hero section with video thumbnail as background */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        {video.thumbnail && (
          <div className="absolute inset-0 w-full h-full">
            <Image 
              src={urlForImage(video.thumbnail).url()} 
              alt={video.title}
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
          </div>
        )}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-start pt-8 pb-8 relative z-10">
          <Link
            href="/knowledgehub/videos"
            className="text-white hover:text-green-300 inline-flex items-center mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Videos
          </Link>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-md">
            {video.title}
          </h1>
          
          <div className="flex flex-wrap gap-3">
            {video.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                <Tag size={14} className="mr-1" />
                {video.category.charAt(0).toUpperCase() + video.category.slice(1).replace(/-/g, ' ')}
              </span>
            )}
            
            {video.duration && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                <Clock size={14} className="mr-1" />
                {video.duration}
              </span>
            )}
            
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 shadow-sm">
              <Calendar size={14} className="mr-1" />
              {new Date(video.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            
            {video.presenter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 shadow-sm">
                <User size={14} className="mr-1" />
                {video.presenter}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8 lg:-mt-12 relative z-10">
        {/* Video player card - enhanced for better height and appearance */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-10"> {/* Main card style */}
          <div className="p-3 sm:p-4"> {/* Padding for the video player wrapper */}
            {/* Wrapper to control video max height and apply individual player styling */}
            <div className="rounded-xl overflow-hidden shadow-lg 
                          max-h-[55vh] 
                          sm:max-h-[60vh] 
                          md:max-h-[65vh] 
                          lg:max-h-[70vh] 
                          xl:max-h-[75vh]">
              {renderVideoEmbed()}
            </div>
          </div>
        </div>
        
        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {video.description && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  About this Video
                </h2>
                <div className="prose prose-green max-w-none">
                  <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">{video.description}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Presenter info if available */}
            {video.presenter && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-5 h-5 text-green-600 mr-2" />
                  Presenter
                </h2>
                <p className="text-gray-700">{video.presenter}</p>
              </div>
            )}
            
            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <Tag className="w-5 h-5 text-green-600 mr-2" />
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <KnowledgeHubFooter />
    </div>
  );
};

export default VideoDetailPage;
