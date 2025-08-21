'use client';

import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle, User, LogOut } from 'lucide-react';

export default function AccessBanner() {
  const { user, contentViewCount, hasReachedLimit, canAccessContent, loading } = useContentAccess();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) return null;

  // Show banner if user is logged in
  if (user) {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-green-700">
                <span className="font-medium">Welcome back{user.email ? `, ${user.email}` : ''}!</span> You have unlimited access to all Knowledge Hub content.
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm text-green-600 hover:text-green-700 border border-green-300 px-3 py-1 rounded hover:bg-green-50"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show different messages based on view count
  const remainingViews = 2 - contentViewCount;

  if (hasReachedLimit) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <p className="text-sm text-red-700">
                <span className="font-medium">Free limit reached.</span> Create an account to continue accessing premium content.
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-sm bg-white text-red-700 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (contentViewCount > 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-yellow-700">
                <span className="font-medium">{remainingViews} free {remainingViews === 1 ? 'article' : 'articles'} remaining.</span> Create an account for unlimited access.
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-sm bg-white text-yellow-700 border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-50"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // First time visitor
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <User className="h-5 w-5 text-blue-400 mr-3" />
          <div>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Welcome to Knowledge Hub!</span> You can explore 2 articles for free, then create an account for unlimited access.
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm bg-white text-blue-700 border border-blue-300 px-3 py-1 rounded hover:bg-blue-50"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
} 