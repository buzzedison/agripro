'use client';

import { useEffect, useRef } from 'react';
import { useContentAccess } from '@/lib/hooks/useContentAccess';

interface ArticleViewTrackerProps {
  articleId: string;
  articleType: string;
  articleTitle?: string;
}

export default function ArticleViewTracker({ articleId, articleType, articleTitle }: ArticleViewTrackerProps) {
  const { trackArticleView, user } = useContentAccess();
  const viewStartTime = useRef<number>(Date.now());
  const hasTrackedView = useRef<boolean>(false);

  useEffect(() => {
    // Track view on component mount
    if (!hasTrackedView.current) {
      trackArticleView(articleId, articleType, articleTitle);
      hasTrackedView.current = true;
    }

    // Track time spent on page
    const trackViewDuration = () => {
      const duration = (Date.now() - viewStartTime.current) / 1000; // in seconds

      // Only track if spent more than 5 seconds on the page
      if (duration > 5) {
        trackArticleView(articleId, articleType, articleTitle, duration);
      }
    };

    // Track on page unload
    const handleBeforeUnload = () => {
      trackViewDuration();
    };

    // Track on visibility change (when user switches tabs or minimizes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackViewDuration();
      } else {
        // Reset start time when returning to page
        viewStartTime.current = Date.now();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackViewDuration();
    };
  }, [articleId, articleType, articleTitle, trackArticleView]);

  // This component doesn't render anything
  return null;
}
