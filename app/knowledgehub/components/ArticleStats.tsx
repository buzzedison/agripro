'use client';

import { useEffect, useState } from 'react';
import { FaEye, FaUser, FaClock } from 'react-icons/fa';

interface ArticleStatsProps {
  articleId: string;
  articleType: string;
  articleTitle?: string;
  showStats?: boolean;
}

interface StatsData {
  totalViews: number;
  uniqueViews: number;
  averageViewDuration?: number;
  lastViewedAt?: string;
}

export default function ArticleStats({ articleId, articleType, articleTitle, showStats = true }: ArticleStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [articleId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/knowledge-hub/article-stats?articleId=${encodeURIComponent(articleId)}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching article stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showStats || loading || !stats) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4 mt-6">
      <div className="flex items-center gap-1">
        <FaEye className="w-4 h-4" />
        <span>{stats.totalViews} views</span>
      </div>
      <div className="flex items-center gap-1">
        <FaUser className="w-4 h-4" />
        <span>{stats.uniqueViews} unique</span>
      </div>
      {stats.averageViewDuration && (
        <div className="flex items-center gap-1">
          <FaClock className="w-4 h-4" />
          <span>{Math.round(stats.averageViewDuration / 60)}m avg</span>
        </div>
      )}
      {stats.lastViewedAt && (
        <div className="text-xs">
          Last viewed {new Date(stats.lastViewedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
