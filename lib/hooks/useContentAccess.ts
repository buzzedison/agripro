'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface ContentAccessState {
  user: User | null;
  loading: boolean;
  contentViewCount: number;
  hasReachedLimit: boolean;
  canAccessContent: boolean;
  incrementViewCount: () => void;
  resetViewCount: () => void;
}

export function useContentAccess(): ContentAccessState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentViewCount, setContentViewCount] = useState(0);
  
  const supabase = createClient();
  const maxFreeViews = 2;

  useEffect(() => {
    // Get initial auth state
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth error:', error);
          setUser(null);
        } else {
          setUser(user);
          console.log('Current user:', user ? 'Logged in' : 'Not logged in');
        }
      } catch (err) {
        console.error('Failed to get user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user ? 'User logged in' : 'No user');
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset view count on login
        if (event === 'SIGNED_IN') {
          setContentViewCount(0);
          if (typeof document !== 'undefined') {
            document.cookie = 'content_views=0; max-age=0; path=/';
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    // Get content view count from cookie
    const getViewCount = () => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const viewCookie = cookies.find(cookie => 
          cookie.trim().startsWith('content_views=')
        );
        if (viewCookie) {
          const count = parseInt(viewCookie.split('=')[1] || '0');
          setContentViewCount(count);
        }
      }
    };

    getViewCount();
  }, []);

  const incrementViewCount = () => {
    if (!user) {
      const newCount = contentViewCount + 1;
      setContentViewCount(newCount);
      
      // Set cookie that expires in 24 hours
      if (typeof document !== 'undefined') {
        const expires = new Date();
        expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
        document.cookie = `content_views=${newCount}; expires=${expires.toUTCString()}; path=/`;
      }
    }
  };

  const resetViewCount = () => {
    setContentViewCount(0);
    if (typeof document !== 'undefined') {
      document.cookie = 'content_views=0; max-age=0; path=/';
    }
  };

  const hasReachedLimit = contentViewCount >= maxFreeViews;
  const canAccessContent = user !== null || !hasReachedLimit;

  return {
    user,
    loading,
    contentViewCount,
    hasReachedLimit,
    canAccessContent,
    incrementViewCount,
    resetViewCount,
  };
} 