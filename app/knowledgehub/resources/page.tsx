'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

// Define resource types
const resources = [
  {
    id: 'roicalculator',
    title: 'ROI Calculator',
    description: 'Calculate return on investment for crops and livestock farming',
    icon: '📊',
    tags: ['financial', 'planning', 'calculator'],
    status: 'available'
  },
  {
    id: 'cropplanning',
    title: 'Crop Planning Calendar',
    description: 'Seasonal planning guide for different crops and regions',
    icon: '🗓️',
    tags: ['planning', 'seasonal', 'crops'],
    status: 'coming-soon'
  },
  {
    id: 'soilhealth',
    title: 'Soil Health Assessment',
    description: 'Guides and calculators for soil testing and management',
    icon: '🌱',
    tags: ['soil', 'testing', 'management'],
    status: 'coming-soon'
  },
  {
    id: 'watermanagement',
    title: 'Water Management Calculator',
    description: 'Tools for irrigation planning and water conservation',
    icon: '💧',
    tags: ['water', 'irrigation', 'conservation'],
    status: 'coming-soon'
  },
  {
    id: 'carbonfootprint',
    title: 'Carbon Footprint Estimator',
    description: 'Calculate and reduce farm carbon emissions',
    icon: '🌍',
    tags: ['sustainability', 'emissions', 'climate'],
    status: 'coming-soon'
  },
  {
    id: 'marketprices',
    title: 'Market Price Analyzer',
    description: 'Track and predict agricultural commodity prices',
    icon: '📈',
    tags: ['market', 'prices', 'trends'],
    status: 'available'
  },
  {
    id: 'equipmentcost',
    title: 'Equipment Cost Calculator',
    description: 'Evaluate machinery purchase vs. leasing options',
    icon: '🚜',
    tags: ['equipment', 'financial', 'planning'],
    status: 'coming-soon'
  },
  {
    id: 'labormanagement',
    title: 'Labor Management Tools',
    description: 'Workforce planning and cost optimization resources',
    icon: '👥',
    tags: ['labor', 'workforce', 'management'],
    status: 'coming-soon'
  },
  {
    id: 'pestmanagement',
    title: 'Pest Management Decision Guide',
    description: 'Economic thresholds and treatment calculators',
    icon: '🐛',
    tags: ['pests', 'management', 'treatment'],
    status: 'coming-soon'
  },
  {
    id: 'grantfinder',
    title: 'Grant and Subsidy Finder',
    description: 'Tools to identify applicable agricultural funding programs',
    icon: '💰',
    tags: ['grants', 'funding', 'subsidies'],
    status: 'coming-soon'
  }
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredResources = resources.filter(resource => {
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">AgriPro Resources</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Practical tools and calculators to help you make better decisions for your agricultural business
        </p>
      </div>
      
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search resources..."
          className="pl-8 w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{resource.icon}</span>
                <h3 className="text-lg font-semibold">{resource.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{resource.description}</p>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              {resource.status === 'available' ? (
                <Link href={resource.id === 'marketprices' ? '/knowledgehub/resources/marketanalyzer' : `/knowledgehub/resources/${resource.id}`} className="w-full">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                    Access Tool
                  </button>
                </Link>
              ) : (
                <button 
                  className="w-full border border-gray-300 text-gray-400 py-2 px-4 rounded-md cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
