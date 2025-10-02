'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, DollarSign, BarChart3, FileText, Settings } from 'lucide-react';
import EnhancedROICalculator from './components/EnhancedROICalculator';
import CropsCalculator from './components/CropsCalculator';
import LivestockCalculator from './components/LivestockCalculator';
import SavedCalculations from './components/SavedCalculations';

export default function ROICalculatorPage() {
  const [activeTab, setActiveTab] = useState('enhanced');

  // Listen for tab change events from SavedCalculations component
  useEffect(() => {
    const handleTabChange = (event: CustomEvent<{ tab: string }>) => {
      setActiveTab(event.detail.tab);
    };
    
    // Add event listener for the custom event
    document.addEventListener('roiTabChange', handleTabChange as EventListener);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('roiTabChange', handleTabChange as EventListener);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-8 shadow-lg">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              ROI Calculator Suite
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Comprehensive tools to calculate, analyze, and optimize your agricultural investments. 
              Make data-driven decisions with our advanced ROI calculators, scenario analysis, and comparison tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span>Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span>PDF & Excel Export</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-600" />
                <span>Scenario Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('enhanced')}
              className={`flex-1 min-w-0 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'enhanced'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" />
                <span>Enhanced Calculator</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full ml-2">New</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('crops')}
              className={`flex-1 min-w-0 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'crops'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Crops Calculator</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('livestock')}
              className={`flex-1 min-w-0 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'livestock'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Livestock Calculator</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 min-w-0 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Saved & Compare</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'enhanced' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Enhanced ROI Calculator</h2>
                    <p className="text-green-100">Step-by-step wizard with advanced features</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>PDF & CSV Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Scenario Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Database Storage</span>
                  </div>
                </div>
              </div>
              <EnhancedROICalculator />
            </div>
          )}
          {activeTab === 'crops' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Crop ROI Calculator</h2>
                    <p className="text-green-100">Calculate returns for your crop farming ventures</p>
                  </div>
                </div>
              </div>
              <CropsCalculator />
            </div>
          )}
          {activeTab === 'livestock' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Livestock ROI Calculator</h2>
                    <p className="text-blue-100">Analyze returns for livestock and dairy farming</p>
                  </div>
                </div>
              </div>
              <LivestockCalculator />
            </div>
          )}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Saved Calculations & Comparisons</h2>
                    <p className="text-purple-100">Manage and compare your saved ROI calculations</p>
                  </div>
                </div>
              </div>
              <SavedCalculations activeTab={activeTab} onTabChange="roiTabChange" />
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our ROI Calculator?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for agricultural businesses with features that matter to farmers and agripreneurs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Analysis</h3>
              <p className="text-gray-600">
                Advanced calculations including payback period, profit margins, break-even analysis, and scenario planning.
              </p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Export & Share</h3>
              <p className="text-gray-600">
                Export calculations to PDF or CSV formats. Save to database and share with team members or investors.
              </p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compare & Optimize</h3>
              <p className="text-gray-600">
                Compare multiple scenarios, analyze different crops or livestock options, and optimize your investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Calculate Your ROI?</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Start with our enhanced calculator or browse our expert resources for additional guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setActiveTab('enhanced')}
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Start Enhanced Calculator
              </button>
              <Link 
                href="/knowledgehub/experts"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                Consult Our Experts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
