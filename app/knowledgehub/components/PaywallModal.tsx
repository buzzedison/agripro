'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Lock, Star, CheckCircle } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType?: string;
  currentPath?: string;
}

export default function PaywallModal({ 
  isOpen, 
  onClose, 
  contentType = 'content',
  currentPath = '/knowledgehub'
}: PaywallModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignUp = () => {
    router.push(`/auth/signup?redirectTo=${encodeURIComponent(currentPath)}`);
  };

  const handleSignIn = () => {
    router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>

          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100 mb-4">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Premium Content
            </h2>
            
            <p className="text-gray-600 mb-6">
              You&apos;ve reached your limit of free {contentType} views. 
              Create an account to continue accessing our Knowledge Hub.
            </p>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                <Star className="h-5 w-5 text-green-600 mr-1" />
                <span className="font-semibold text-green-700">Premium Benefits</span>
              </div>
              <ul className="text-left space-y-2 text-sm text-green-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Unlimited access to all articles and insights
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Exclusive whitepapers and research papers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Expert advice and best practices
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Free access - no subscription required
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSignUp}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Create Free Account
              </button>
              
              <button
                onClick={handleSignIn}
                className="w-full bg-white text-green-600 border border-green-600 py-3 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Sign In
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Join thousands of farmers and agricultural professionals already using our platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 