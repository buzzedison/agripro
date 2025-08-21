'use client';

import { useState } from 'react';
import KnowledgeHubNavbar from '../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../components/KnowledgeHubFooter';
import AdvancedSearch from '../components/AdvancedSearch';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <KnowledgeHubNavbar />
      
      <div className="flex-grow">
        <div className="bg-gradient-to-r from-green-600 to-green-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Knowledge Hub Search
              </h1>
              <p className="text-green-100 text-lg max-w-3xl mx-auto">
                Find the agricultural knowledge you need from our comprehensive collection of best practices, 
                insights, whitepapers, and expert advice.
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* AI Assistant Banner */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Need help finding something?</h3>
                  <p className="text-gray-600">
                    Our AI assistant can help you find exactly what you're looking for using natural language.
                  </p>
                </div>
              </div>
              <Link 
                href="/knowledgehub?chatbot=open" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ask AI Assistant
              </Link>
            </div>
          </div>
          
          {/* Advanced Search Component */}
          <AdvancedSearch />
        </div>
      </div>
      
      <KnowledgeHubFooter />
    </div>
  );
}
