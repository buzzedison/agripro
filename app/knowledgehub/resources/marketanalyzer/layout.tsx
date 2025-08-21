import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Price Analyzer - AgriPro Knowledge Hub',
  description: 'Intelligent market intelligence and price tracking for agricultural products across different regions',
  keywords: 'market analysis, price tracking, agricultural prices, market intelligence, farming, agriculture'
};

export default function MarketAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 