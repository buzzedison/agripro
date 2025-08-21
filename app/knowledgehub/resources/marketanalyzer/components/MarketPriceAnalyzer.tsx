'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, DollarSign, MapPin, Calendar, BarChart3, AlertTriangle, Download, Plus, Eye, Filter, Activity, Globe, Bell, Users } from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  unit_of_measurement: string;
}

interface Region {
  id: string;
  name: string;
  country: string;
  state_province: string;
  city: string;
}

interface Market {
  id: string;
  name: string;
  market_type: string;
  region_id: string;
}

interface PriceRecord {
  id: string;
  product_id: string;
  price_per_unit: number;
  price_date: string;
  currency: string;
  price_type: string;
  agricultural_products: Product;
  markets: Market;
  regions: Region;
}

interface Analytics {
  current_price: number;
  average_price: number;
  min_price: number;
  max_price: number;
  volatility: number;
  price_trend: string;
  trend_percentage: number;
  market_sentiment: string;
  data_points: number;
}

const MarketPriceAnalyzer: React.FC = () => {
  // Core State
  const [activeView, setActiveView] = useState('real-time');
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time Features
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [priceType, setPriceType] = useState('all');

  // Advanced Features
  const [alertsActive, setAlertsActive] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Data Source Management
  const [useRealData, setUseRealData] = useState(false);
  const [dataSource, setDataSource] = useState<'sample' | 'real'>('sample');
  const [availableDataSources, setAvailableDataSources] = useState<string[]>([]);
  const [enhancedAnalytics, setEnhancedAnalytics] = useState<any>(null);

  // Currency detection
  const [userCurrency, setUserCurrency] = useState('KES'); // Default fallback

  // New price form
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [newPrice, setNewPrice] = useState({
    product_id: '',
    market_id: '',
    region_id: '',
    price_per_unit: '',
    price_date: new Date().toISOString().split('T')[0],
    currency: 'KES', // Will be updated based on location
    price_type: 'wholesale',
    quality_grade: '',
    quantity_available: '',
    source: 'manual',
    notes: ''
  });

  // Detect user's location and set currency
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Try to get user's timezone first
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let detectedCurrency = 'KES'; // Default fallback
        
        // Map common African timezones to currencies
        const timezoneMap: { [key: string]: string } = {
          'Africa/Accra': 'GHS',
          'Africa/Lagos': 'NGN', 
          'Africa/Nairobi': 'KES',
          'Africa/Kampala': 'KES',
          'Africa/Dar_es_Salaam': 'KES',
          'Africa/Johannesburg': 'ZAR',
          'Africa/Cape_Town': 'ZAR'
        };

        if (timezoneMap[timezone]) {
          detectedCurrency = timezoneMap[timezone];
        } else {
          // Try to get location via browser geolocation as backup
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                try {
                  // Use reverse geocoding to get country
                  const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                  );
                  const data = await response.json();
                  
                  const countryMap: { [key: string]: string } = {
                    'Ghana': 'GHS',
                    'Nigeria': 'NGN',
                    'Kenya': 'KES',
                    'Uganda': 'KES', 
                    'Tanzania': 'KES',
                    'South Africa': 'ZAR'
                  };
                  
                  if (data.countryName && countryMap[data.countryName]) {
                    detectedCurrency = countryMap[data.countryName];
                    setUserCurrency(detectedCurrency);
                    setNewPrice(prev => ({ ...prev, currency: detectedCurrency }));
                  }
                } catch (error) {
                  console.log('Geolocation reverse geocoding failed, using timezone-based currency');
                }
              },
              (error) => {
                console.log('Geolocation failed, using timezone-based currency');
              },
              { timeout: 5000 }
            );
          }
        }
        
        setUserCurrency(detectedCurrency);
        setNewPrice(prev => ({ ...prev, currency: detectedCurrency }));
        
      } catch (error) {
        console.log('Currency detection failed, using default KES');
      }
    };

    detectUserCurrency();
  }, []);

  // Load initial data
  useEffect(() => {
    // Load sample data instead of API calls for now
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    // Sample products
    const sampleProducts: Product[] = [
      { id: '1', name: 'Maize (Corn)', category: 'crops', subcategory: 'grains', unit_of_measurement: 'kg' },
      { id: '2', name: 'Rice', category: 'crops', subcategory: 'grains', unit_of_measurement: 'kg' },
      { id: '3', name: 'Wheat', category: 'crops', subcategory: 'grains', unit_of_measurement: 'kg' },
      { id: '4', name: 'Coffee Beans', category: 'crops', subcategory: 'cash_crops', unit_of_measurement: 'kg' },
      { id: '5', name: 'Tomatoes', category: 'crops', subcategory: 'vegetables', unit_of_measurement: 'kg' },
      { id: '6', name: 'Onions', category: 'crops', subcategory: 'vegetables', unit_of_measurement: 'kg' },
      { id: '7', name: 'Potatoes', category: 'crops', subcategory: 'vegetables', unit_of_measurement: 'kg' },
      { id: '8', name: 'Bananas', category: 'crops', subcategory: 'fruits', unit_of_measurement: 'kg' },
      { id: '9', name: 'Milk', category: 'livestock', subcategory: 'dairy', unit_of_measurement: 'liters' },
      { id: '10', name: 'Beef', category: 'livestock', subcategory: 'meat', unit_of_measurement: 'kg' }
    ];

    // Sample regions
    const sampleRegions: Region[] = [
      { id: '1', name: 'Nairobi', country: 'Kenya', state_province: 'Nairobi County', city: 'Nairobi' },
      { id: '2', name: 'Mombasa', country: 'Kenya', state_province: 'Mombasa County', city: 'Mombasa' },
      { id: '3', name: 'Kisumu', country: 'Kenya', state_province: 'Kisumu County', city: 'Kisumu' },
      { id: '4', name: 'Nakuru', country: 'Kenya', state_province: 'Nakuru County', city: 'Nakuru' },
      { id: '5', name: 'Eldoret', country: 'Kenya', state_province: 'Uasin Gishu County', city: 'Eldoret' },
      { id: '6', name: 'Lagos', country: 'Nigeria', state_province: 'Lagos State', city: 'Lagos' },
      { id: '7', name: 'Kano', country: 'Nigeria', state_province: 'Kano State', city: 'Kano' },
      { id: '8', name: 'Accra', country: 'Ghana', state_province: 'Greater Accra', city: 'Accra' },
      { id: '9', name: 'Kampala', country: 'Uganda', state_province: 'Central Region', city: 'Kampala' },
      { id: '10', name: 'Dar es Salaam', country: 'Tanzania', state_province: 'Dar es Salaam Region', city: 'Dar es Salaam' }
    ];

    // Sample markets
    const sampleMarkets: Market[] = [
      { id: '1', name: 'Wakulima Market', market_type: 'wholesale', region_id: '1' },
      { id: '2', name: 'City Market', market_type: 'retail', region_id: '1' },
      { id: '3', name: 'Kongowea Market', market_type: 'wholesale', region_id: '2' },
      { id: '4', name: 'Kibuye Market', market_type: 'retail', region_id: '3' },
      { id: '5', name: 'Nakuru Central Market', market_type: 'wholesale', region_id: '4' },
      { id: '6', name: 'Eldoret Main Market', market_type: 'wholesale', region_id: '5' },
      { id: '7', name: 'Mile 12 Market', market_type: 'wholesale', region_id: '6' },
      { id: '8', name: 'Sabon Gari Market', market_type: 'wholesale', region_id: '7' },
      { id: '9', name: 'Makola Market', market_type: 'retail', region_id: '8' },
      { id: '10', name: 'Owino Market', market_type: 'wholesale', region_id: '9' }
    ];

    setProducts(sampleProducts);
    setRegions(sampleRegions);
    setMarkets(sampleMarkets);
  };

  // Filter markets based on selected region (using sample data)
  const filteredMarkets = selectedRegion && selectedRegion !== 'all' 
    ? markets.filter(market => market?.region_id === selectedRegion)
    : markets;

  // Reset market selection when region changes
  useEffect(() => {
    if (selectedRegion === 'all') {
      setSelectedMarket('all');
    } else if (selectedRegion && selectedMarket !== 'all') {
      // Check if the current market is still valid for the selected region
      const regionMarkets = markets.filter(market => market?.region_id === selectedRegion);
      const isMarketValid = regionMarkets.some(market => market?.id === selectedMarket);
      if (!isMarketValid) {
        setSelectedMarket('all');
      }
    }
  }, [selectedRegion, selectedMarket, markets]); // Removed filteredMarkets dependency

  // Load real data from APIs
  const loadRealData = async (): Promise<boolean> => {
    try {
      const selectedProductData = products.find(p => p?.id === selectedProduct);
      const selectedRegionData = selectedRegion && selectedRegion !== 'all' 
        ? regions.find(r => r?.id === selectedRegion) 
        : null;
      const selectedMarketData = selectedMarket && selectedMarket !== 'all' 
        ? markets.find(m => m?.id === selectedMarket && m?.region_id === selectedRegion) 
        : null;

      if (!selectedProductData) {
        console.error('Product not found for real data loading');
        return false;
      }

      // Determine country for API call
      const country = selectedRegionData?.country?.toLowerCase() || 'kenya';
      const commodity = selectedProductData.name.toLowerCase().split(' ')[0]; // Get first word (e.g., "Maize" from "Maize (Corn)")
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      console.log(`Attempting to load real data for ${commodity} in ${country}`);
      
      const response = await fetch(`/api/market-analyzer/real-data?` + new URLSearchParams({
        commodity: commodity,
        country: country,
        start_date: startDate,
        end_date: endDate,
        sources: 'fao,worldBank'
      }));

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both real data and fallback sample data
      if (data.data && data.data.length > 0) {
        // Check if this is fallback sample data
        const isRealData = data.data_type !== 'fallback_sample';
        const dataSourceNote = data.message || '';
        
        // Transform data to match our interface
        const transformedData: PriceRecord[] = data.data.map((item: any, index: number) => ({
          id: `real_${index}`,
          product_id: selectedProduct,
          price_per_unit: item.price,
          price_date: item.date,
          currency: item.currency || userCurrency,
          price_type: priceType === 'all' ? 'wholesale' : priceType,
          agricultural_products: selectedProductData,
          markets: selectedMarketData || { 
            id: 'real_market', 
            name: `${item.source} Market`, 
            market_type: 'wholesale', 
            region_id: selectedRegion || '1' 
          },
          regions: selectedRegionData || { 
            id: 'real_region', 
            name: item.country || 'Global', 
            country: item.country || 'Unknown', 
            state_province: 'N/A', 
            city: 'N/A' 
          }
        }));

        // Calculate enhanced analytics from real data
        const prices = transformedData.map(r => r.price_per_unit);
        const sortedData = transformedData.sort((a, b) => new Date(a.price_date).getTime() - new Date(b.price_date).getTime());
        
        const currentPrice = prices[prices.length - 1]; // Most recent price
        const averagePrice = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Calculate real volatility (standard deviation)
        const variance = prices.reduce((acc, price) => acc + Math.pow(price - averagePrice, 2), 0) / prices.length;
        const volatility = Math.round(Math.sqrt(variance) * 100) / 100;
        
        // Calculate price trend (comparing recent vs older data)
        const recentPrices = prices.slice(-Math.min(7, Math.floor(prices.length / 3))); // Last third or 7 data points
        const olderPrices = prices.slice(0, Math.min(7, Math.floor(prices.length / 3))); // First third or 7 data points
        const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
        const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
        
        const trendDirection = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';
        const trendPercentage = Math.round(((recentAvg - olderAvg) / olderAvg) * 100 * 100) / 100;
        
        // Determine market sentiment based on multiple factors
        let sentiment = 'neutral';
        if (trendPercentage > 5) sentiment = 'bullish';
        else if (trendPercentage < -5) sentiment = 'bearish';
        else if (currentPrice > averagePrice * 1.1) sentiment = 'bullish';
        else if (currentPrice < averagePrice * 0.9) sentiment = 'bearish';
        
        const realAnalytics: Analytics = {
          current_price: currentPrice,
          average_price: averagePrice,
          min_price: minPrice,
          max_price: maxPrice,
          volatility: volatility,
          price_trend: trendDirection,
          trend_percentage: trendPercentage,
          market_sentiment: sentiment,
          data_points: transformedData.length
        };

        // Generate enhanced analytics for real data
        const enhancedAnalysis = {
          data_quality: {
            source_reliability: data.sources_used?.length > 1 ? 'High' : 'Medium',
            data_freshness: calculateDataFreshness(sortedData[sortedData.length - 1]?.price_date),
            coverage_score: Math.min(100, (transformedData.length / parseInt(dateRange)) * 100),
            sources_used: data.sources_used || []
          },
          market_insights: {
            price_stability: volatility < averagePrice * 0.1 ? 'Stable' : volatility < averagePrice * 0.2 ? 'Moderate' : 'Volatile',
            seasonal_pattern: detectSeasonalPattern(sortedData),
            market_efficiency: calculateMarketEfficiency(prices),
            supply_demand_indicator: currentPrice > averagePrice ? 'Demand Pressure' : 'Supply Surplus'
          },
          comparative_analysis: {
            vs_historical_avg: ((currentPrice - averagePrice) / averagePrice * 100).toFixed(1),
            price_position: currentPrice === maxPrice ? 'At Peak' : currentPrice === minPrice ? 'At Low' : 'Moderate',
            volatility_vs_normal: volatility > averagePrice * 0.15 ? 'Above Normal' : 'Normal',
            trend_strength: Math.abs(trendPercentage) > 10 ? 'Strong' : Math.abs(trendPercentage) > 5 ? 'Moderate' : 'Weak'
          },
          forecasting: {
            short_term_outlook: trendDirection === 'increasing' ? 'Upward Pressure' : trendDirection === 'decreasing' ? 'Downward Pressure' : 'Sideways Movement',
            confidence_level: data.sources_used?.length > 1 && transformedData.length > 10 ? 'High' : 'Medium',
            risk_factors: generateRiskFactors(volatility, trendPercentage, sentiment)
          }
        };
        
        setEnhancedAnalytics(enhancedAnalysis);

        setPriceRecords(transformedData);
        setAnalytics(realAnalytics);
        setLastUpdate(new Date());
        setAvailableDataSources(data.sources_used || []);
        
        // Set appropriate data source and messaging
        if (isRealData) {
          setDataSource('real');
          console.log(`Successfully loaded ${transformedData.length} real data points from sources: ${data.sources_used?.join(', ')}`);
        } else {
          setDataSource('sample');
          console.log(`${dataSourceNote} - Generated ${transformedData.length} fallback data points`);
        }
        
        return true;
        
      } else {
        console.log('No real data available:', data.message);
        return false;
      }

    } catch (error) {
      console.error('Error loading real data:', error);
      setError(`Failed to load real data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  // Load price data when filters change and real-time updates will be added after loadPriceData definition

  // Note: Now supports both real and sample data

  const loadPriceData = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try real data first if enabled
      if (useRealData) {
        const realDataSuccess = await loadRealData();
        if (realDataSuccess) {
          setDataSource('real');
          setLoading(false);
          return;
        }
        // If real data fails, fall back to sample data
        console.log('Real data unavailable, falling back to sample data');
      }
      
      // Generate sample price data with null safety
      const selectedProductData = products.find(p => p?.id === selectedProduct);
      const selectedRegionData = selectedRegion && selectedRegion !== 'all' 
        ? regions.find(r => r?.id === selectedRegion) 
        : null;
      const selectedMarketData = selectedMarket && selectedMarket !== 'all' 
        ? markets.find(m => m?.id === selectedMarket && m?.region_id === selectedRegion) 
        : null;
      
      if (!selectedProductData) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      // Validate filters
      if (selectedRegion && selectedRegion !== 'all' && !selectedRegionData) {
        setError('Selected region not found');
        setLoading(false);
        return;
      }

      if (selectedMarket && selectedMarket !== 'all' && !selectedMarketData) {
        setError('Selected market not found or not available in selected region');
        setLoading(false);
        return;
      }

      // Generate sample price records for the date range
      const samplePriceRecords: PriceRecord[] = [];
      const basePrice = Math.random() * 80 + 20; // Random base price between 20-100
      const days = parseInt(dateRange);
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add some realistic price variation (seasonal, market factors)
        const seasonalFactor = Math.sin((i / 365) * 2 * Math.PI) * 5; // ±5 seasonal variation
        const randomFactor = (Math.random() - 0.5) * 8; // ±4 random variation
        const currentPrice = Math.max(basePrice + seasonalFactor + randomFactor, 5);
        
        // Determine currency based on region with null safety, fallback to user's detected currency
        let currency = userCurrency; // Use detected user currency as default
        if (selectedRegionData?.country) {
          switch (selectedRegionData.country) {
            case 'Ghana': currency = 'GHS'; break;
            case 'South Africa': currency = 'ZAR'; break;
            case 'Nigeria': currency = 'NGN'; break;
            case 'Kenya': 
            case 'Uganda': 
            case 'Tanzania': 
            default: currency = 'KES'; break;
          }
        }
        
        // Adjust prices based on currency (rough conversion)
        let adjustedPrice = currentPrice;
        switch (currency) {
          case 'KES': adjustedPrice = currentPrice * 130; break; // ~130 KES per USD
          case 'GHS': adjustedPrice = currentPrice * 12; break;  // ~12 GHS per USD
          case 'ZAR': adjustedPrice = currentPrice * 18; break;  // ~18 ZAR per USD
          case 'NGN': adjustedPrice = currentPrice * 800; break; // ~800 NGN per USD
          default: adjustedPrice = currentPrice; break; // USD
        }

        samplePriceRecords.push({
          id: `${i}`,
          product_id: selectedProduct,
          price_per_unit: Math.round(adjustedPrice * 100) / 100, // Round to 2 decimals
          price_date: date.toISOString().split('T')[0],
          currency: currency,
          price_type: priceType === 'all' ? 'wholesale' : priceType,
          agricultural_products: selectedProductData,
          markets: selectedMarketData || { 
            id: 'default', 
            name: `${selectedRegionData?.name || 'Default'} Market`, 
            market_type: 'wholesale', 
            region_id: selectedRegion || '1' 
          },
          regions: selectedRegionData || { 
            id: 'default', 
            name: 'All Regions', 
            country: 'Kenya', 
            state_province: 'Default', 
            city: 'Default' 
          }
        });
      }

      // Generate sample analytics
      const prices = samplePriceRecords.map(r => r.price_per_unit);
      const currentPrice = prices[0];
      const averagePrice = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      const sampleAnalytics: Analytics = {
        current_price: currentPrice,
        average_price: averagePrice,
        min_price: minPrice,
        max_price: maxPrice,
        volatility: Math.round((Math.random() * 15 + 5) * 100) / 100, // Random volatility 5-20%
        price_trend: currentPrice > averagePrice ? 'increasing' : currentPrice < averagePrice ? 'decreasing' : 'stable',
        trend_percentage: Math.round(((currentPrice - averagePrice) / averagePrice) * 100 * 100) / 100,
        market_sentiment: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.25 ? 'bearish' : 'neutral',
        data_points: samplePriceRecords.length
      };

      setPriceRecords(samplePriceRecords);
      setAnalytics(sampleAnalytics);
      setLastUpdate(new Date());
      setDataSource('sample');
      
    } catch (error) {
      console.error('Error loading price data:', error);
      setError('Failed to load price data');
    } finally {
      setLoading(false);
    }
  }; // Removed useCallback

  // Load price data when filters change
  useEffect(() => {
    if (selectedProduct) {
      loadPriceData();
    }
  }, [selectedProduct, selectedRegion, selectedMarket, dateRange, priceType]); // Removed loadPriceData from deps

  // Real-time updates using sample data
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (liveUpdates && selectedProduct) {
      interval = setInterval(() => {
        // Refresh data using the sample data function
        loadPriceData();
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [liveUpdates, refreshInterval, selectedProduct]); // Removed loadPriceData from deps

  const loadAnalytics = async (analysisType: string = 'all') => {
    if (!selectedProduct) return null;
    
    setLoading(true);
    try {
      // Generate sample analytics data
      const selectedProductData = products.find(p => p?.id === selectedProduct);
      const selectedRegionData = selectedRegion && selectedRegion !== 'all' 
        ? regions.find(r => r?.id === selectedRegion) 
        : null;

      if (!selectedProductData) return null;

      // Generate sample seasonal pattern
      const seasonalPattern = Array.from({ length: 12 }, (_, i) => ({
        month_name: new Date(2023, i).toLocaleDateString('en-US', { month: 'short' }),
        average_price: Math.round((Math.random() * 50 + 30) * 100) / 100,
        volatility: Math.round((Math.random() * 10 + 5) * 100) / 100
      }));

      // Generate sample intelligence data
      const intelligence = {
        min_price: Math.round((Math.random() * 20 + 10) * 100) / 100,
        max_price: Math.round((Math.random() * 30 + 80) * 100) / 100,
        volatility: Math.round((Math.random() * 15 + 8) * 100) / 100,
        analysis_period: `${dateRange} days`,
        data_points: parseInt(dateRange),
        market_trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
        supply_demand_ratio: Math.round((Math.random() * 0.5 + 0.75) * 100) / 100
      };

      return {
        seasonal_pattern: seasonalPattern,
        intelligence: intelligence,
        product: selectedProductData,
        region: selectedRegionData
      };
    } catch (error) {
      console.error('Error loading analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addPriceRecord = async () => {
    if (!newPrice.product_id || !newPrice.market_id || !newPrice.region_id || !newPrice.price_per_unit) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/market-analyzer/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrice),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setShowAddPrice(false);
        setNewPrice({
          product_id: '',
          market_id: '',
          region_id: '',
          price_per_unit: '',
          price_date: new Date().toISOString().split('T')[0],
          currency: 'KES',
          price_type: 'wholesale',
          quality_grade: '',
          quantity_available: '',
          source: 'manual',
          notes: ''
        });
        loadPriceData(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding price record:', error);
      setError('Failed to add price record');
    }
  };

  // Export function
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting data in format:', exportFormat);
  };

  // Enhanced analytics utility functions
  const calculateDataFreshness = (lastDate: string): string => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate <= 1) return 'Very Fresh';
    if (daysSinceUpdate <= 7) return 'Fresh';
    if (daysSinceUpdate <= 30) return 'Moderate';
    return 'Stale';
  };

  const detectSeasonalPattern = (data: PriceRecord[]): string => {
    if (data.length < 12) return 'Insufficient Data';
    // Simple seasonal detection based on price patterns
    const monthlyAvgs = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);
    
    data.forEach(record => {
      const month = new Date(record.price_date).getMonth();
      monthlyAvgs[month] += record.price_per_unit;
      monthlyCounts[month]++;
    });
    
    const avgPrices = monthlyAvgs.map((sum, i) => monthlyCounts[i] > 0 ? sum / monthlyCounts[i] : 0);
    const maxMonth = avgPrices.indexOf(Math.max(...avgPrices));
    const minMonth = avgPrices.indexOf(Math.min(...avgPrices));
    
    const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'];
    return `Peak: ${seasons[maxMonth]}, Low: ${seasons[minMonth]}`;
  };

  const calculateMarketEfficiency = (prices: number[]): string => {
    if (prices.length < 5) return 'Insufficient Data';
    // Calculate how much prices deviate from moving average
    const movingAvgDeviations = [];
    for (let i = 2; i < prices.length; i++) {
      const movingAvg = (prices[i-2] + prices[i-1] + prices[i]) / 3;
      movingAvgDeviations.push(Math.abs(prices[i] - movingAvg) / movingAvg);
    }
    const avgDeviation = movingAvgDeviations.reduce((a, b) => a + b, 0) / movingAvgDeviations.length;
    
    if (avgDeviation < 0.05) return 'Highly Efficient';
    if (avgDeviation < 0.1) return 'Efficient';
    if (avgDeviation < 0.2) return 'Moderately Efficient';
    return 'Inefficient';
  };

  const generateRiskFactors = (volatility: number, trendPercentage: number, sentiment: string): string[] => {
    const risks = [];
    if (volatility > 50) risks.push('High Price Volatility');
    if (Math.abs(trendPercentage) > 15) risks.push('Rapid Price Movement');
    if (sentiment === 'bearish') risks.push('Negative Market Sentiment');
    if (sentiment === 'bullish') risks.push('Potential Price Bubble');
    if (risks.length === 0) risks.push('Low Risk Environment');
    return risks;
  };

  // Helper functions
  const formatPrice = (price: number, currency: string = userCurrency) => {
    const currencyMap: { [key: string]: string } = {
      'KES': 'en-KE',
      'GHS': 'en-GH', 
      'ZAR': 'en-ZA',
      'NGN': 'en-NG',
      'USD': 'en-US',
      'EUR': 'en-EU',
      'GBP': 'en-GB'
    };
    
    const locale = currencyMap[currency] || 'en-US';
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(price);
    } catch (error) {
      // Fallback for currencies that might not be supported
      return `${currency} ${price.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-100 text-green-800';
      case 'bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Prepare chart data with null safety
  const chartData = priceRecords
    .filter(record => record && record.price_date && record.price_per_unit != null)
    .map(record => ({
      date: formatDate(record.price_date),
      price: record.price_per_unit,
      market: record.markets?.name || 'Unknown Market',
      region: record.regions?.name || 'Unknown Region'
    }));

  const selectedProductData = products.find(p => p?.id === selectedProduct);

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Clean Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Agricultural Market Intelligence</h1>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-600">Real-time Price Tracking & Analytics</span>
                  <span className={`font-medium ${dataSource === 'real' ? 'text-blue-600' : 'text-orange-600'}`}>
                    • {dataSource === 'real' ? 'Live Data' : 'Demo Mode'}
                  </span>
                  {userCurrency !== 'KES' && (
                    <span className="text-blue-600">• {userCurrency}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons Only */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowAddPrice(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Data
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport()}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadPriceData()}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Settings Bar */}
          <div className="border-t border-gray-100 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Data Source Toggle */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Data Source:</span>
                  <div 
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      useRealData 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setUseRealData(!useRealData)}
                  >
                    <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200 ${
                      useRealData ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                        useRealData ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium ${useRealData ? 'text-blue-700' : 'text-gray-700'}`}>
                      {useRealData ? 'Live APIs' : 'Demo'}
                    </span>
                  </div>
                </div>

                {/* Auto Refresh Toggle */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Auto Refresh:</span>
                  <div 
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      liveUpdates 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setLiveUpdates(!liveUpdates)}
                  >
                    <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200 ${
                      liveUpdates ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                        liveUpdates ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium ${liveUpdates ? 'text-green-700' : 'text-gray-700'}`}>
                      {liveUpdates ? 'ON' : 'OFF'}
                    </span>
                    {liveUpdates && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {lastUpdate && (
                  <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
                )}
                {useRealData && dataSource === 'sample' && (
                  <span className="text-orange-600 font-medium">Fallback Sample Data</span>
                )}
                {useRealData && dataSource === 'real' && availableDataSources.length > 0 && (
                  <span className="text-green-600 font-medium">Sources: {availableDataSources.join(', ')}</span>
                )}
                {!useRealData && dataSource === 'sample' && (
                  <span className="text-blue-600 font-medium">Demo Mode</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Fallback Data Notice */}
        {useRealData && dataSource === 'sample' && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Real data sources temporarily unavailable.</strong> The system is showing generated sample data for demonstration. 
              Real data integration requires stable API connections. You can continue exploring with demo data or check back later.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Market Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="product">Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id} className="hover:bg-gray-100">
                        {product.name} ({product.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="hover:bg-gray-100">All regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id} className="hover:bg-gray-100">
                        {region.name}, {region.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="market">Market</Label>
                <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="All markets" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="hover:bg-gray-100">All markets</SelectItem>
                    {filteredMarkets.map(market => (
                      <SelectItem key={market.id} value={market.id} className="hover:bg-gray-100">
                        {market.name} ({market.market_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Time Period</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="7" className="hover:bg-gray-100">Last 7 days</SelectItem>
                    <SelectItem value="30" className="hover:bg-gray-100">Last 30 days</SelectItem>
                    <SelectItem value="90" className="hover:bg-gray-100">Last 3 months</SelectItem>
                    <SelectItem value="180" className="hover:bg-gray-100">Last 6 months</SelectItem>
                    <SelectItem value="365" className="hover:bg-gray-100">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priceType">Price Type</Label>
                <Select value={priceType} onValueChange={setPriceType}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="hover:bg-gray-100">All types</SelectItem>
                    <SelectItem value="wholesale" className="hover:bg-gray-100">Wholesale</SelectItem>
                    <SelectItem value="retail" className="hover:bg-gray-100">Retail</SelectItem>
                    <SelectItem value="farm_gate" className="hover:bg-gray-100">Farm Gate</SelectItem>
                    <SelectItem value="spot" className="hover:bg-gray-100">Spot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Analytics Panel (Real Data Only) */}
        {dataSource === 'real' && enhancedAnalytics && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <BarChart3 className="w-5 h-5" />
                <span>Real Data Intelligence</span>
                <Badge variant="default" className="bg-blue-600">Live Analysis</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Data Quality */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Data Quality</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reliability:</span>
                      <span className="font-medium">{enhancedAnalytics.data_quality.source_reliability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Freshness:</span>
                      <span className="font-medium">{enhancedAnalytics.data_quality.data_freshness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coverage:</span>
                      <span className="font-medium">{Math.round(enhancedAnalytics.data_quality.coverage_score)}%</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      Sources: {enhancedAnalytics.data_quality.sources_used.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Market Insights */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Market Insights</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stability:</span>
                      <span className="font-medium">{enhancedAnalytics.market_insights.price_stability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className="font-medium">{enhancedAnalytics.market_insights.market_efficiency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supply/Demand:</span>
                      <span className="font-medium text-xs">{enhancedAnalytics.market_insights.supply_demand_indicator}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      {enhancedAnalytics.market_insights.seasonal_pattern}
                    </div>
                  </div>
                </div>

                {/* Comparative Analysis */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Price Analysis</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">vs Average:</span>
                      <span className={`font-medium ${parseFloat(enhancedAnalytics.comparative_analysis.vs_historical_avg) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {enhancedAnalytics.comparative_analysis.vs_historical_avg}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">{enhancedAnalytics.comparative_analysis.price_position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volatility:</span>
                      <span className="font-medium">{enhancedAnalytics.comparative_analysis.volatility_vs_normal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend:</span>
                      <span className="font-medium">{enhancedAnalytics.comparative_analysis.trend_strength}</span>
                    </div>
                  </div>
                </div>

                {/* Forecasting */}
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">Outlook</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Short-term:</span>
                      <span className="font-medium text-xs">{enhancedAnalytics.forecasting.short_term_outlook}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium">{enhancedAnalytics.forecasting.confidence_level}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-600 text-xs">Risk Factors:</span>
                      <div className="mt-1">
                        {enhancedAnalytics.forecasting.risk_factors.map((risk: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1 border-orange-300 text-orange-700">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Intelligent Tools Navigation */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="real-time" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Real-time</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Regional</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Smart Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Collaborate</span>
            </TabsTrigger>
          </TabsList>

          {/* Real-time Price Tracking */}
          <TabsContent value="real-time" className="space-y-6">
            {/* Real-time Controls */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span>Real-time Price Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={liveUpdates ? "default" : "secondary"}>
                      {liveUpdates ? "Live" : "Paused"}
                    </Badge>
                    <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                      <SelectTrigger className="w-32 bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="5" className="hover:bg-gray-100">5 seconds</SelectItem>
                        <SelectItem value="15" className="hover:bg-gray-100">15 seconds</SelectItem>
                        <SelectItem value="30" className="hover:bg-gray-100">30 seconds</SelectItem>
                        <SelectItem value="60" className="hover:bg-gray-100">1 minute</SelectItem>
                        <SelectItem value="300" className="hover:bg-gray-100">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Multi-Market Coverage</h4>
                    <p className="text-sm text-gray-600">Monitoring {markets.length} markets across {regions.length} regions</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Historical Data</h4>
                    <p className="text-sm text-gray-600">Access to {priceRecords.length} price records</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Live Updates</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${liveUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span className="text-sm text-gray-600">
                        {liveUpdates ? `Refreshing every ${refreshInterval}s` : 'Updates paused'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedProduct && analytics && (
              <>
                {/* Enhanced Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Current Price</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {analytics.current_price != null 
                              ? formatPrice(analytics.current_price, priceRecords[0]?.currency || 'KES')
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Price</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {analytics.average_price != null 
                              ? formatPrice(analytics.average_price, priceRecords[0]?.currency || 'KES')
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Price Trend</p>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(analytics.price_trend)}
                            <span className="text-2xl font-bold text-gray-900">
                              {analytics.trend_percentage != null 
                                ? `${analytics.trend_percentage.toFixed(1)}%`
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                        <Badge className={getSentimentColor(analytics.market_sentiment)}>
                          {analytics.market_sentiment}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Volatility</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {analytics.volatility != null 
                              ? `${analytics.volatility.toFixed(1)}%`
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Price Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Price Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [
                                formatPrice(value as number, priceRecords[0]?.currency || 'KES'), 
                                'Price'
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#16a34a" 
                              strokeWidth={2}
                              dot={{ fill: '#16a34a' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No price data available for the selected filters</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Info */}
                {selectedProductData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Product Name</Label>
                          <p className="text-lg font-semibold">{selectedProductData.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Category</Label>
                          <p className="text-lg">{selectedProductData.category}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Unit</Label>
                          <p className="text-lg">{selectedProductData.unit_of_measurement}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!selectedProduct && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Product</h3>
                  <p className="text-gray-600">Choose a product from the filters above to view market intelligence and price analytics.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>Advanced Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Volatility Analysis</h4>
                    <p className="text-sm text-gray-600">Deep insights into price volatility patterns</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Seasonal Trends</h4>
                    <p className="text-sm text-gray-600">Identify seasonal patterns and cycles</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Predictions</h4>
                    <p className="text-sm text-gray-600">AI-powered price forecasting</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Market Sentiment</h4>
                    <p className="text-sm text-gray-600">Analyze market mood and trader confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedProduct ? (
              <AnalyticsView 
                productId={selectedProduct} 
                regionId={selectedRegion}
                loadAnalytics={loadAnalytics}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Product</h3>
                  <p className="text-gray-600">Choose a product to view detailed analytics and market intelligence.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Regional Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            {selectedProduct ? (
              <RegionalComparison 
                productId={selectedProduct}
                loadAnalytics={loadAnalytics}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Product</h3>
                  <p className="text-gray-600">Choose a product to compare prices across different regions.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Smart Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <span>Smart Alert System</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch checked={alertsActive} onCheckedChange={setAlertsActive} />
                    <Label>Alerts Active</Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Price Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified when prices hit your target thresholds</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Trend Notifications</h4>
                    <p className="text-sm text-gray-600">Alert on significant trend changes and market shifts</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Custom Triggers</h4>
                    <p className="text-sm text-gray-600">Set up personalized alert conditions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span>Data Export & Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">CSV Export</h4>
                    <p className="text-sm text-gray-600 mb-3">Export price data for spreadsheet analysis</p>
                    <Button className="w-full" variant="outline">Export CSV</Button>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">PDF Reports</h4>
                    <p className="text-sm text-gray-600 mb-3">Generate comprehensive market reports</p>
                    <Button className="w-full" variant="outline">Generate PDF</Button>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Excel Format</h4>
                    <p className="text-sm text-gray-600 mb-3">Export with charts and analytics included</p>
                    <Button className="w-full" variant="outline">Export Excel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaborate" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Collaborative Platform</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Team Sharing</h4>
                    <p className="text-sm text-gray-600 mb-3">Share insights with your team members</p>
                    <Button className="w-full" variant="outline">Share Data</Button>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Data Contribution</h4>
                    <p className="text-sm text-gray-600 mb-3">Contribute price data to the community</p>
                    <Button className="w-full" variant="outline">Contribute</Button>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Community Insights</h4>
                    <p className="text-sm text-gray-600 mb-3">Access insights from other farmers and traders</p>
                    <Button className="w-full" variant="outline">View Insights</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Records</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading price data...</p>
                  </div>
                ) : priceRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Product</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Market</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Region</th>
                          <th className="border border-gray-200 px-4 py-2 text-right">Price</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceRecords.map(record => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">{formatDate(record.price_date)}</td>
                            <td className="border border-gray-200 px-4 py-2">{record.agricultural_products.name}</td>
                            <td className="border border-gray-200 px-4 py-2">{record.markets.name}</td>
                            <td className="border border-gray-200 px-4 py-2">{record.regions.name}</td>
                            <td className="border border-gray-200 px-4 py-2 text-right font-semibold">
                              {formatPrice(record.price_per_unit, record.currency)}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              <Badge variant="outline">{record.price_type}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Price Data</h3>
                    <p className="text-gray-600">No price records found for the selected filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Price Modal */}
      {showAddPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Price Record</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="newProduct">Product *</Label>
                <Select value={newPrice.product_id} onValueChange={(value) => setNewPrice({...newPrice, product_id: value})}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id} className="hover:bg-gray-100">
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="newRegion">Region *</Label>
                <Select value={newPrice.region_id} onValueChange={(value) => setNewPrice({...newPrice, region_id: value})}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id} className="hover:bg-gray-100">
                        {region.name}, {region.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="newMarket">Market *</Label>
                <Select value={newPrice.market_id} onValueChange={(value) => setNewPrice({...newPrice, market_id: value})}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {markets.map(market => (
                      <SelectItem key={market.id} value={market.id} className="hover:bg-gray-100">
                        {market.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPrice">Price *</Label>
                  <Input
                    id="newPrice"
                    type="number"
                    step="0.01"
                    value={newPrice.price_per_unit}
                    onChange={(e) => setNewPrice({...newPrice, price_per_unit: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="newCurrency">Currency</Label>
                  <Select value={newPrice.currency} onValueChange={(value) => setNewPrice({...newPrice, currency: value})}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                                         <SelectContent className="bg-white border border-gray-200 shadow-lg">
                       <SelectItem value="USD" className="hover:bg-gray-100">USD - US Dollar</SelectItem>
                       <SelectItem value="KES" className="hover:bg-gray-100">KES - Kenya Shilling</SelectItem>
                       <SelectItem value="GHS" className="hover:bg-gray-100">GHS - Ghana Cedi</SelectItem>
                       <SelectItem value="ZAR" className="hover:bg-gray-100">ZAR - South African Rand</SelectItem>
                       <SelectItem value="NGN" className="hover:bg-gray-100">NGN - Nigerian Naira</SelectItem>
                       <SelectItem value="EUR" className="hover:bg-gray-100">EUR - Euro</SelectItem>
                       <SelectItem value="GBP" className="hover:bg-gray-100">GBP - British Pound</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="newPriceType">Price Type</Label>
                <Select value={newPrice.price_type} onValueChange={(value) => setNewPrice({...newPrice, price_type: value})}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="wholesale" className="hover:bg-gray-100">Wholesale</SelectItem>
                    <SelectItem value="retail" className="hover:bg-gray-100">Retail</SelectItem>
                    <SelectItem value="farm_gate" className="hover:bg-gray-100">Farm Gate</SelectItem>
                    <SelectItem value="spot" className="hover:bg-gray-100">Spot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="newDate">Date</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newPrice.price_date}
                  onChange={(e) => setNewPrice({...newPrice, price_date: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddPrice(false)}>
                Cancel
              </Button>
              <Button onClick={addPriceRecord} className="bg-green-600 hover:bg-green-700">
                Add Price
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics View Component
const AnalyticsView: React.FC<{ productId: string; regionId: string; loadAnalytics: (type: string) => Promise<any> }> = ({ 
  productId, 
  regionId, 
  loadAnalytics 
}) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      loadAnalyticsData();
    }
  }, [productId, regionId]);

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    const data = await loadAnalytics('all');
    setAnalyticsData(data);
    setLoading(false);
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analyticsData?.seasonal_pattern && (
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Price Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.seasonal_pattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average_price" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {analyticsData?.intelligence && (
        <Card>
          <CardHeader>
            <CardTitle>Market Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">Price Range</h4>
                <p className="text-sm text-blue-700">
                  Min: ${analyticsData.intelligence.min_price.toFixed(2)} | 
                  Max: ${analyticsData.intelligence.max_price.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900">Volatility</h4>
                <p className="text-sm text-green-700">
                  ${analyticsData.intelligence.volatility.toFixed(2)} over {analyticsData.intelligence.analysis_period}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900">Data Quality</h4>
                <p className="text-sm text-purple-700">
                  {analyticsData.intelligence.data_points} price points analyzed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Regional Comparison Component
const RegionalComparison: React.FC<{ productId: string; loadAnalytics: (type: string) => Promise<any> }> = ({ 
  productId, 
  loadAnalytics 
}) => {
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      loadComparisonData();
    }
  }, [productId]);

  const loadComparisonData = useCallback(async () => {
    setLoading(true);
    const data = await loadAnalytics('regional');
    setComparisonData(data);
    setLoading(false);
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading comparison data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comparisonData?.regional_comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparisonData.regional_comparison.map((region: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{region.region.name}</h4>
                    <p className="text-sm text-gray-600">{region.region.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${region.average_price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{region.price_count} records</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketPriceAnalyzer; 