import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Retrieve market analytics and intelligence
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get('product_id');
    const regionId = searchParams.get('region_id');
    const timePeriod = searchParams.get('time_period') || 'monthly';
    const analysisType = searchParams.get('analysis_type') || 'trends';
    const limit = parseInt(searchParams.get('limit') || '12');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    let responseData: any = {};

    // Get price trends and analytics
    if (analysisType === 'trends' || analysisType === 'all') {
      const { data: trendsData, error: trendsError } = await supabase
        .from('price_analytics')
        .select('*')
        .eq('product_id', productId)
        .eq('time_period', timePeriod)
        .eq('region_id', regionId || '')
        .order('analysis_date', { ascending: false })
        .limit(limit);

      if (trendsError) {
        console.error('Trends error:', trendsError);
      } else {
        responseData.trends = trendsData || [];
      }
    }

    // Get price comparison across regions
    if (analysisType === 'regional' || analysisType === 'all') {
      const { data: regionalData, error: regionalError } = await supabase
        .from('price_records')
        .select(`
          region_id,
          price_per_unit,
          price_date,
          regions!inner(id, name, country, state_province)
        `)
        .eq('product_id', productId)
        .gte('price_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .eq('verification_status', 'verified')
        .order('price_date', { ascending: false });

      if (regionalError) {
        console.error('Regional error:', regionalError);
      } else {
        // Group by region and calculate averages
        const regionMap = new Map();
        regionalData?.forEach(record => {
          const regionKey = record.region_id;
          if (!regionMap.has(regionKey)) {
            regionMap.set(regionKey, {
              region: record.regions,
              prices: [],
              total: 0,
              count: 0
            });
          }
          const regionData = regionMap.get(regionKey);
          regionData.prices.push(record.price_per_unit);
          regionData.total += record.price_per_unit;
          regionData.count += 1;
        });

        const regionalComparison = Array.from(regionMap.entries()).map(([regionId, data]: [string, any]) => ({
          region_id: regionId,
          region: data.region,
          average_price: data.total / data.count,
          price_count: data.count,
          latest_prices: data.prices.slice(0, 5)
        }));

        responseData.regional_comparison = regionalComparison;
      }
    }

    // Get market intelligence insights
    if (analysisType === 'intelligence' || analysisType === 'all') {
      // Calculate price volatility and trends
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: recentPrices, error: recentError } = await supabase
        .from('price_records')
        .select('price_per_unit, price_date')
        .eq('product_id', productId)
        .eq('region_id', regionId || '')
        .gte('price_date', thirtyDaysAgo)
        .eq('verification_status', 'verified')
        .order('price_date', { ascending: true });

      if (!recentError && recentPrices && recentPrices.length > 0) {
        const prices = recentPrices.map(p => p.price_per_unit);
        const currentPrice = prices[prices.length - 1];
        const oldestPrice = prices[0];
        
        // Calculate statistics
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Calculate volatility (standard deviation)
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
        const volatility = Math.sqrt(variance);
        
        // Calculate trend
        const priceChange = ((currentPrice - oldestPrice) / oldestPrice) * 100;
        const trend = priceChange > 5 ? 'increasing' : priceChange < -5 ? 'decreasing' : 'stable';
        
        // Market sentiment based on recent price movements
        const recentTrend = prices.length > 7 ? 
          ((prices.slice(-7).reduce((sum, p) => sum + p, 0) / 7) - 
           (prices.slice(-14, -7).reduce((sum, p) => sum + p, 0) / 7)) / 
          (prices.slice(-14, -7).reduce((sum, p) => sum + p, 0) / 7) * 100 : 0;
        
        const sentiment = recentTrend > 3 ? 'bullish' : recentTrend < -3 ? 'bearish' : 'neutral';

        responseData.intelligence = {
          current_price: currentPrice,
          average_price: avgPrice,
          min_price: minPrice,
          max_price: maxPrice,
          volatility: volatility,
          price_trend: trend,
          trend_percentage: priceChange,
          market_sentiment: sentiment,
          data_points: prices.length,
          analysis_period: '30 days'
        };
      }
    }

    // Get seasonal patterns
    if (analysisType === 'seasonal' || analysisType === 'all') {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: seasonalData, error: seasonalError } = await supabase
        .from('price_records')
        .select('price_per_unit, price_date')
        .eq('product_id', productId)
        .eq('region_id', regionId || '')
        .gte('price_date', oneYearAgo)
        .eq('verification_status', 'verified')
        .order('price_date', { ascending: true });

      if (!seasonalError && seasonalData && seasonalData.length > 0) {
        // Group by month
        const monthlyData = new Map();
        seasonalData.forEach(record => {
          const month = new Date(record.price_date).getMonth();
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { prices: [], total: 0, count: 0 });
          }
          const monthData = monthlyData.get(month);
          monthData.prices.push(record.price_per_unit);
          monthData.total += record.price_per_unit;
          monthData.count += 1;
        });

        const seasonalPattern = Array.from(monthlyData.entries()).map(([month, data]: [number, any]) => ({
          month: month + 1,
          month_name: new Date(2024, month, 1).toLocaleString('default', { month: 'long' }),
          average_price: data.total / data.count,
          price_count: data.count,
          min_price: Math.min(...data.prices),
          max_price: Math.max(...data.prices)
        }));

        responseData.seasonal_pattern = seasonalPattern;
      }
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Generate and store analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { product_id, region_id, time_period = 'monthly' } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Calculate analytics based on recent price data
    const analysisDate = new Date().toISOString().split('T')[0];
    
    // Get price data for analysis
    const periodDays = time_period === 'daily' ? 1 : 
                      time_period === 'weekly' ? 7 : 
                      time_period === 'monthly' ? 30 : 
                      time_period === 'quarterly' ? 90 : 365;
    
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data: priceData, error: priceError } = await supabase
      .from('price_records')
      .select('price_per_unit, price_date, quantity_available')
      .eq('product_id', product_id)
      .eq('region_id', region_id || '')
      .gte('price_date', startDate)
      .eq('verification_status', 'verified')
      .order('price_date', { ascending: true });

    if (priceError || !priceData || priceData.length === 0) {
      return NextResponse.json(
        { error: 'Insufficient price data for analysis' },
        { status: 400 }
      );
    }

    // Calculate analytics
    const prices = priceData.map(p => p.price_per_unit);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    
    // Calculate volatility
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);
    
    // Calculate trend
    const oldestPrice = prices[0];
    const newestPrice = prices[prices.length - 1];
    const trendPercentage = ((newestPrice - oldestPrice) / oldestPrice) * 100;
    const trend = trendPercentage > 5 ? 'increasing' : trendPercentage < -5 ? 'decreasing' : 'stable';
    
    // Determine supply and demand levels (simplified)
    const avgQuantity = priceData
      .filter(p => p.quantity_available)
      .reduce((sum, p) => sum + (p.quantity_available || 0), 0) / 
      priceData.filter(p => p.quantity_available).length;
    
    const supplyLevel = avgQuantity > 1000 ? 'high' : avgQuantity > 500 ? 'medium' : 'low';
    const demandLevel = volatility > avgPrice * 0.1 ? 'high' : volatility > avgPrice * 0.05 ? 'medium' : 'low';
    
    // Market sentiment
    const sentiment = trendPercentage > 3 ? 'bullish' : trendPercentage < -3 ? 'bearish' : 'neutral';
    
    // Simple predictions (in a real system, you'd use more sophisticated models)
    const predictedNextWeek = newestPrice * (1 + (trendPercentage / 100) * 0.25);
    const predictedNextMonth = newestPrice * (1 + (trendPercentage / 100) * 1);
    
    // Create analytics record
    const analyticsData = {
      product_id,
      region_id: region_id || '',
      analysis_date: analysisDate,
      time_period,
      avg_price: avgPrice,
      min_price: minPrice,
      max_price: maxPrice,
      median_price: medianPrice,
      price_volatility: volatility,
      price_trend: trend,
      trend_percentage: trendPercentage,
      supply_level: supplyLevel,
      demand_level: demandLevel,
      market_sentiment: sentiment,
      predicted_price_next_week: predictedNextWeek,
      predicted_price_next_month: predictedNextMonth,
      prediction_confidence: 0.7, // Simplified confidence score
      data_points_count: prices.length,
      calculation_method: 'statistical_analysis'
    };

    // Insert or update analytics
    const { data: result, error } = await supabase
      .from('price_analytics')
      .upsert([analyticsData], { 
        onConflict: 'product_id,region_id,analysis_date,time_period' 
      })
      .select()
      .single();

    if (error) {
      console.error('Analytics error:', error);
      return NextResponse.json(
        { error: 'Failed to save analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 