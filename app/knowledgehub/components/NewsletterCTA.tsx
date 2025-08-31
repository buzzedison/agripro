'use client';

import { useState } from 'react';
import { useContentAccess } from '@/lib/hooks/useContentAccess';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const { user } = useContentAccess();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/knowledge-hub/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          signupSource: 'newsletter',
          userId: user?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Successfully subscribed!');
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.error || 'Failed to subscribe. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-green-800 rounded-2xl text-white p-6 sm:p-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          Stay Updated with Agribusiness Insights
        </h2>
        <p className="text-green-100 mb-6 sm:mb-8 text-sm sm:text-base">
          Join our newsletter to receive the latest insights, research papers, and industry updates directly in your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-white text-green-800 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </section>
  );
} 