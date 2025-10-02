import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Export price data and analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') || 'csv';
    const productId = searchParams.get('product_id');
    const regionId = searchParams.get('region_id');
    const marketId = searchParams.get('market_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const exportType = searchParams.get('export_type') || 'prices'; // prices, analytics, comparison

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let data: any[] = [];
    let filename = 'market_data';

    // Export price records
    if (exportType === 'prices') {
      let query = supabase
        .from('price_records')
        .select(`
          *,
          agricultural_products!inner(id, name, category, subcategory, unit_of_measurement),
          markets!inner(id, name, market_type),
          regions!inner(id, name, country, state_province, city)
        `)
        .eq('verification_status', 'verified')
        .order('price_date', { ascending: false });

      // Apply filters
      if (productId) query = query.eq('product_id', productId);
      if (regionId) query = query.eq('region_id', regionId);
      if (marketId) query = query.eq('market_id', marketId);
      if (startDate) query = query.gte('price_date', startDate);
      if (endDate) query = query.lte('price_date', endDate);

      const { data: priceData, error } = await query;
      
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch price data' }, { status: 500 });
      }

      data = priceData || [];
      filename = `price_records_${new Date().toISOString().split('T')[0]}`;
    }

    // Export analytics data
    else if (exportType === 'analytics') {
      if (!productId) {
        return NextResponse.json({ error: 'Product ID required for analytics export' }, { status: 400 });
      }

      let query = supabase
        .from('price_analytics')
        .select('*')
        .eq('product_id', productId)
        .order('analysis_date', { ascending: false });

      if (regionId) query = query.eq('region_id', regionId);

      const { data: analyticsData, error } = await query;
      
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
      }

      data = analyticsData || [];
      filename = `analytics_${productId}_${new Date().toISOString().split('T')[0]}`;
    }

    // Export regional comparison
    else if (exportType === 'comparison') {
      if (!productId) {
        return NextResponse.json({ error: 'Product ID required for comparison export' }, { status: 400 });
      }

      // Get recent price data for comparison
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: comparisonData, error } = await supabase
        .from('price_records')
        .select(`
          region_id,
          price_per_unit,
          price_date,
          regions!inner(id, name, country, state_province, city)
        `)
        .eq('product_id', productId)
        .gte('price_date', thirtyDaysAgo)
        .eq('verification_status', 'verified');

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch comparison data' }, { status: 500 });
      }

      // Group by region and calculate averages
      const regionMap = new Map();
      comparisonData?.forEach(record => {
        const regionKey = record.region_id;
        const regionData = Array.isArray(record.regions) ? record.regions[0] : record.regions;
        
        if (!regionMap.has(regionKey)) {
          regionMap.set(regionKey, {
            region_id: regionKey,
            region_name: regionData?.name || 'Unknown',
            country: regionData?.country || 'Unknown',
            state_province: regionData?.state_province || 'Unknown',
            city: regionData?.city || 'Unknown',
            prices: [],
            total: 0,
            count: 0
          });
        }
        const regionMapData = regionMap.get(regionKey);
        regionMapData.prices.push(record.price_per_unit);
        regionMapData.total += record.price_per_unit;
        regionMapData.count += 1;
      });

      data = Array.from(regionMap.values()).map(regionData => ({
        region_id: regionData.region_id,
        region_name: regionData.region_name,
        country: regionData.country,
        state_province: regionData.state_province,
        city: regionData.city,
        average_price: regionData.total / regionData.count,
        min_price: Math.min(...regionData.prices),
        max_price: Math.max(...regionData.prices),
        price_count: regionData.count,
        price_range: Math.max(...regionData.prices) - Math.min(...regionData.prices)
      }));

      filename = `regional_comparison_${productId}_${new Date().toISOString().split('T')[0]}`;
    }

    // Generate export based on format
    if (format === 'csv') {
      const csvContent = convertToCSV(data, exportType);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    else if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });
    }

    else if (format === 'pdf') {
      // For PDF, we'll return the data and let the frontend handle PDF generation
      return NextResponse.json({
        success: true,
        data: data,
        metadata: {
          export_type: exportType,
          generated_at: new Date().toISOString(),
          record_count: data.length,
          filters: {
            product_id: productId,
            region_id: regionId,
            market_id: marketId,
            start_date: startDate,
            end_date: endDate
          }
        }
      });
    }

    else {
      return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 });
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Bulk export multiple datasets
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { exports, format = 'csv' } = body;

    if (!exports || !Array.isArray(exports)) {
      return NextResponse.json(
        { error: 'Exports array is required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const exportConfig of exports) {
      const { export_type, product_id, region_id, market_id, start_date, end_date } = exportConfig;

      // Build query parameters
      const params = new URLSearchParams({
        format: format,
        export_type: export_type,
      });

      if (product_id) params.append('product_id', product_id);
      if (region_id) params.append('region_id', region_id);
      if (market_id) params.append('market_id', market_id);
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);

      // Make internal API call
      const exportResponse = await fetch(`${request.url}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
        },
      });

      if (exportResponse.ok) {
        const exportData = await exportResponse.text();
        results.push({
          export_type,
          success: true,
          data: exportData,
          filename: `${export_type}_${product_id}_${new Date().toISOString().split('T')[0]}.${format}`
        });
      } else {
        results.push({
          export_type,
          success: false,
          error: 'Failed to export data'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bulk export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: any[], exportType: string): string {
  if (!data || data.length === 0) {
    return 'No data available';
  }

  let headers: string[] = [];
  let rows: string[][] = [];

  if (exportType === 'prices') {
    headers = [
      'Date',
      'Product Name',
      'Category',
      'Subcategory',
      'Unit',
      'Price',
      'Currency',
      'Price Type',
      'Quality Grade',
      'Quantity Available',
      'Market Name',
      'Market Type',
      'Region',
      'Country',
      'State/Province',
      'City',
      'Source',
      'Reliability Score',
      'Notes'
    ];

    rows = data.map(record => [
      record.price_date,
      record.agricultural_products.name,
      record.agricultural_products.category,
      record.agricultural_products.subcategory || '',
      record.agricultural_products.unit_of_measurement,
      record.price_per_unit.toString(),
      record.currency,
      record.price_type,
      record.quality_grade || '',
      record.quantity_available?.toString() || '',
      record.markets.name,
      record.markets.market_type,
      record.regions.name,
      record.regions.country,
      record.regions.state_province || '',
      record.regions.city || '',
      record.source,
      record.reliability_score?.toString() || '',
      record.notes || ''
    ]);
  }

  else if (exportType === 'analytics') {
    headers = [
      'Analysis Date',
      'Time Period',
      'Average Price',
      'Min Price',
      'Max Price',
      'Median Price',
      'Volatility',
      'Price Trend',
      'Trend Percentage',
      'Supply Level',
      'Demand Level',
      'Market Sentiment',
      'Predicted Price Next Week',
      'Predicted Price Next Month',
      'Prediction Confidence',
      'Data Points Count'
    ];

    rows = data.map(record => [
      record.analysis_date,
      record.time_period,
      record.avg_price?.toString() || '',
      record.min_price?.toString() || '',
      record.max_price?.toString() || '',
      record.median_price?.toString() || '',
      record.price_volatility?.toString() || '',
      record.price_trend || '',
      record.trend_percentage?.toString() || '',
      record.supply_level || '',
      record.demand_level || '',
      record.market_sentiment || '',
      record.predicted_price_next_week?.toString() || '',
      record.predicted_price_next_month?.toString() || '',
      record.prediction_confidence?.toString() || '',
      record.data_points_count?.toString() || ''
    ]);
  }

  else if (exportType === 'comparison') {
    headers = [
      'Region Name',
      'Country',
      'State/Province',
      'City',
      'Average Price',
      'Min Price',
      'Max Price',
      'Price Range',
      'Data Points'
    ];

    rows = data.map(record => [
      record.region_name,
      record.country,
      record.state_province || '',
      record.city || '',
      record.average_price.toFixed(2),
      record.min_price.toFixed(2),
      record.max_price.toFixed(2),
      record.price_range.toFixed(2),
      record.price_count.toString()
    ]);
  }

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  return csvContent;
} 