'use client';

import Link from 'next/link';
import { Calculator, TrendingUp, BarChart3, Zap, ArrowRight } from 'lucide-react';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: string;
  featured: boolean;
  color: string;
}

const tools: Tool[] = [
  {
    id: 'roi-calculator',
    title: 'ROI Calculator',
    description: 'Calculate return on investment for crops and livestock to make informed financial decisions.',
    icon: <Calculator className="w-6 h-6" />,
    href: '/knowledgehub/resources/roicalculator',
    category: 'Financial',
    featured: true,
    color: 'bg-green-500'
  },
  {
    id: 'market-analyzer',
    title: 'Market Price Analyzer',
    description: 'Track and analyze market prices for agricultural products across different regions.',
    icon: <TrendingUp className="w-6 h-6" />,
    href: '/knowledgehub/resources/marketanalyzer',
    category: 'Market Intelligence',
    featured: true,
    color: 'bg-blue-500'
  },
  {
    id: 'yield-predictor',
    title: 'Yield Predictor',
    description: 'Predict crop yields based on weather patterns, soil conditions, and historical data.',
    icon: <BarChart3 className="w-6 h-6" />,
    href: '/knowledgehub/tools/yield-predictor',
    category: 'Analytics',
    featured: false,
    color: 'bg-purple-500'
  },
  {
    id: 'decision-matrix',
    title: 'Agribusiness Decision Matrix',
    description: 'Compare agribusiness ideas with weighted, Ghana-specific criteria to choose the best opportunity.',
    icon: <BarChart3 className="w-6 h-6" />,
    href: '/knowledgehub/tools/decision-matrix',
    category: 'Decision Support',
    featured: true,
    color: 'bg-teal-500'
  },
  {
    id: 'cost-optimizer',
    title: 'Cost Optimizer',
    description: 'Optimize input costs for fertilizers, seeds, and other agricultural resources.',
    icon: <Zap className="w-6 h-6" />,
    href: '/knowledgehub/tools/cost-optimizer',
    category: 'Optimization',
    featured: false,
    color: 'bg-orange-500'
  }
];

export default function ToolsSection() {
  const featuredTools = tools.filter(tool => tool.featured);
  const otherTools = tools.filter(tool => !tool.featured);

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agricultural Tools</h2>
          <p className="text-gray-600">Powerful tools to help you make data-driven farming decisions</p>
        </div>
        <Link 
          href="/knowledgehub/resources" 
          className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1 transition-colors"
        >
          View all tools
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Tool</h3>
          <div className="grid gap-6">
            {featuredTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className={`${tool.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {tool.title}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{tool.description}</p>
                    <div className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                      Launch Tool
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other Tools */}
      {otherTools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">More Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${tool.color} p-2 rounded-md text-white`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {tool.title}
                    </h4>
                    <span className="text-xs text-gray-500">{tool.category}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                <div className="flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Try it out
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Need a Custom Tool?</h3>
            <p className="text-green-100">We can build specialized tools for your specific agricultural needs.</p>
          </div>
          <Link
            href="/contact"
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
} 