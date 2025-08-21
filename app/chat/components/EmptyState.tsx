'use client';

import React from 'react';
import { Leaf, Droplets, Sun, Cloud, LucideIcon } from 'lucide-react';
import { EmptyStateProps } from '../types';
import Image from 'next/image';

interface ExamplePrompt {
  text: string;
  icon: React.ReactNode;
  category: string;
  color: string;
}

export default function EmptyState({ onExampleClick }: EmptyStateProps) {
  const examples: ExamplePrompt[] = [
    {
      text: "What are sustainable farming practices for corn in the Midwest?",
      icon: <Leaf className="h-5 w-5" />,
      category: "Sustainability",
      color: "text-green-600 bg-green-50 border-green-200",
    },
    {
      text: "How can I identify and treat common wheat diseases?",
      icon: <Droplets className="h-5 w-5" />,
      category: "Crop Health",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      text: "What are the best crop rotation strategies for small farms?",
      icon: <Sun className="h-5 w-5" />,
      category: "Farm Management",
      color: "text-orange-600 bg-orange-50 border-orange-200",
    },
    {
      text: "How can I optimize irrigation for water conservation?",
      icon: <Cloud className="h-5 w-5" />,
      category: "Water Management",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 relative mb-6">
        <Image 
          src="/images/agripro-chat-logo.png" 
          alt="AgriPro AI" 
          fill
          className="object-contain"
        />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Welcome to AgriPro AI Assistant
      </h2>
      
      <p className="text-gray-600 max-w-lg mb-10 leading-relaxed">
        Your expert companion for all agriculture-related questions. Ask anything about farming, crops, 
        sustainable practices, precision agriculture, and more.
      </p>
      
      <div className="w-full max-w-2xl">
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center justify-center">
          <span className="w-12 h-px bg-gray-200 mr-3"></span>
          Get started with an example
          <span className="w-12 h-px bg-gray-200 ml-3"></span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(example.text)}
              className="flex flex-col items-start p-4 text-left border rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div className={`rounded-full p-2.5 ${example.color} mb-2`}>
                {example.icon}
              </div>
              
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-gray-500">{example.category}</div>
                <p className="text-sm text-gray-800 font-medium group-hover:text-green-700 transition-colors">
                  {example.text}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-500 mb-2">
            This chat interface is powered by multiple AI models. You can switch models using the selector in the top-right corner.
          </p>
          <p className="text-xs text-gray-400">
            Results may vary between models. Agriculture-specific knowledge may be limited to data available in each model&apos;s training dataset.
          </p>
        </div>
      </div>
    </div>
  );
} 