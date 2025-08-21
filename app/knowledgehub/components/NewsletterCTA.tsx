'use client';

export default function NewsletterCTA() {
  return (
    <section className="bg-green-800 rounded-2xl text-white p-6 sm:p-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          Stay Updated with Agribusiness Insights
        </h2>
        <p className="text-green-100 mb-6 sm:mb-8 text-sm sm:text-base">
          Join our newsletter to receive the latest insights, research papers, and industry updates directly in your inbox.
        </p>
        <form className="flex flex-col gap-3 sm:flex-row sm:gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-white text-green-800 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
} 