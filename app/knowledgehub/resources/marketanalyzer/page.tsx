import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import MarketPriceAnalyzer from './components/MarketPriceAnalyzer';

export const metadata: Metadata = {
  title: 'Market Price Analyzer - AgriPro Hub',
  description: 'Intelligent market intelligence and price tracking for agricultural products across different regions. Get real-time insights, trends, and analytics.',
  keywords: 'market analysis, price tracking, agricultural prices, market intelligence, farming, agriculture'
};

export default function MarketAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/knowledgehub" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to Knowledge Hub
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Market Price Analyzer</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Analyzer Tool */}
      <MarketPriceAnalyzer />
    </div>
  );
} 