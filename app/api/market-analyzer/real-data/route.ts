import { NextRequest, NextResponse } from 'next/server';

// Real data source configurations
const DATA_SOURCES = {
  fao: {
    baseUrl: 'https://fenixservices.fao.org/faostat/api/v1/en/data/QCL',
    apiKey: process.env.FAO_API_KEY || '',
  },
  worldBank: {
    baseUrl: 'https://api.worldbank.org/v2/country',
    format: 'json',
  },
  // Alternative simple APIs for testing
  mockApi: {
    baseUrl: 'https://jsonplaceholder.typicode.com',
  },
  // Add more sources as needed
};

// Commodity mapping for different APIs
const COMMODITY_MAPPING = {
  'maize': {
    fao: '56', // FAO item code for Maize
    worldBank: 'PMAIZMTUSDM',
  },
  'rice': {
    fao: '27', // FAO item code for Rice, paddy
    worldBank: 'PRICEUSDM',
  },
  'wheat': {
    fao: '15', // FAO item code for Wheat
    worldBank: 'PWHEATUSDM',
  },
  'sorghum': {
    fao: '83', // FAO item code for Sorghum
    worldBank: 'PSORGTUSDM',
  },
  'cassava': {
    fao: '125', // FAO item code for Cassava
    worldBank: 'PCASSTUSDM',
  }
};

// Country/Region mapping
const REGION_MAPPING = {
  'kenya': { fao: '114', worldBank: 'KE' }, // FAO area code for Kenya
  'ghana': { fao: '81', worldBank: 'GH' }, // FAO area code for Ghana
  'nigeria': { fao: '159', worldBank: 'NG' }, // FAO area code for Nigeria
  'south africa': { fao: '202', worldBank: 'ZA' }, // FAO area code for South Africa
  'ethiopia': { fao: '238', worldBank: 'ET' }, // FAO area code for Ethiopia
};

// Fetch data from FAO API
async function fetchFAOData(commodity: string, country: string, startDate: string, endDate: string) {
  try {
    const commodityCode = COMMODITY_MAPPING[commodity as keyof typeof COMMODITY_MAPPING]?.fao;
    const countryCode = REGION_MAPPING[country as keyof typeof REGION_MAPPING]?.fao;
    
    if (!commodityCode || !countryCode) {
      console.log(`FAO: Commodity ${commodity} or country ${country} not supported`);
      return null;
    }

    // FAO FAOSTAT API format - using production data as prices might not be available
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    
    const url = `${DATA_SOURCES.fao.baseUrl}?area=${countryCode}&item=${commodityCode}&year=${startYear}:${endYear}&show_codes=true`;
    
    console.log(`FAO API URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgriPro-Market-Analyzer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`FAO API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`FAO API response:`, JSON.stringify(data).substring(0, 200));
    return transformFAOData(data);
  } catch (error) {
    console.error('FAO API error:', error);
    return null;
  }
}

// Fetch data from World Bank API
async function fetchWorldBankData(commodity: string, country: string, startDate: string, endDate: string) {
  try {
    const commodityCode = COMMODITY_MAPPING[commodity as keyof typeof COMMODITY_MAPPING]?.worldBank;
    const countryCode = REGION_MAPPING[country as keyof typeof REGION_MAPPING]?.worldBank;
    
    if (!commodityCode || !countryCode) {
      throw new Error('Commodity or country not supported');
    }

    const url = `${DATA_SOURCES.worldBank.baseUrl}/${commodityCode}?country=${countryCode}&date=${startDate}:${endDate}&format=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status}`);
    }

    const data = await response.json();
    return transformWorldBankData(data);
  } catch (error) {
    console.error('World Bank API error:', error);
    return null;
  }
}

// Fetch sample data when real APIs fail
async function fetchFallbackData(commodity: string, country: string) {
  // Generate realistic sample data
  const basePrice = {
    'maize': 250,
    'rice': 450,
    'wheat': 300,
    'sorghum': 200,
    'cassava': 150
  }[commodity] || 250;

  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic price variation
    const variation = (Math.random() - 0.5) * 0.2; // ±10%
    const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.1;
    const price = basePrice * (1 + variation + seasonalFactor);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
      currency: 'USD',
      source: 'Sample Data',
      commodity: commodity.charAt(0).toUpperCase() + commodity.slice(1),
      country: country.charAt(0).toUpperCase() + country.slice(1),
      unit: 'USD/metric ton'
    });
  }
  
  return data;
}

// Data transformation functions
function transformFAOData(data: any) {
  if (!data || !data.data) return [];
  
  return data.data.map((item: any) => ({
    date: item.Year,
    price: parseFloat(item.Value),
    currency: 'USD',
    source: 'FAO',
    commodity: item.Item,
    country: item.Area,
    unit: item.Unit || 'USD/tonne'
  }));
}

function transformWorldBankData(data: any) {
  if (!data || !Array.isArray(data) || data.length < 2) return [];
  
  const prices = data[1]; // World Bank API returns metadata in [0], data in [1]
  
  return prices.map((item: any) => ({
    date: item.date,
    price: parseFloat(item.value),
    currency: 'USD',
    source: 'World Bank',
    commodity: item.indicator?.value || 'Unknown',
    country: item.country?.value || 'Global',
    unit: 'USD/metric ton'
  })).filter((item: any) => item.price !== null);
}

// Enhanced data transformation for better reliability
function enhanceDataReliability(data: any[], source: string) {
  return data
    .filter(item => item && item.price && !isNaN(item.price))
    .map(item => ({
      ...item,
      source,
      reliability: source === 'FAO' ? 0.9 : source === 'World Bank' ? 0.85 : 0.7,
      timestamp: new Date().toISOString()
    }));
}

// Main API handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity')?.toLowerCase() || 'maize';
    const country = searchParams.get('country')?.toLowerCase() || 'kenya';
    const startDate = searchParams.get('start_date') || '2023-01-01';
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const sources = searchParams.get('sources')?.split(',') || ['fao', 'worldBank'];

    console.log(`Fetching ${commodity} prices for ${country} from ${startDate} to ${endDate}`);

    // Fetch data from multiple sources in parallel
    const dataPromises = [];
    
    if (sources.includes('fao')) {
      dataPromises.push(fetchFAOData(commodity, country, startDate, endDate));
    }
    
    if (sources.includes('worldBank')) {
      dataPromises.push(fetchWorldBankData(commodity, country, startDate, endDate));
    }
    
    // Note: ESOKO removed - focusing on free API sources only

    const results = await Promise.allSettled(dataPromises);
    
    // Combine successful results
    const combinedData = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .flatMap(result => (result as PromiseFulfilledResult<any>).value)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // If no real data found, generate fallback data
    if (combinedData.length === 0) {
      console.log('No real data found, generating fallback data');
      const fallbackData = await fetchFallbackData(commodity, country);
      
      return NextResponse.json({
        data: fallbackData,
        message: 'Real data sources temporarily unavailable. Showing sample data for demonstration.',
        sources_attempted: sources,
        data_type: 'fallback_sample',
        note: 'This is generated sample data. Real data integration requires API keys and stable connections.'
      });
    }

    return NextResponse.json({
      data: combinedData,
      sources_used: sources,
      total_records: combinedData.length,
      date_range: { start: startDate, end: endDate },
      commodity,
      country
    });

  } catch (error) {
    console.error('Real data API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch real market data',
        details: error instanceof Error ? error.message : 'Unknown error',
        sample_data_available: true
      },
      { status: 500 }
    );
  }
} 