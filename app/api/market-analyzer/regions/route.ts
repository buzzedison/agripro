import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Retrieve regions and markets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const country = searchParams.get('country');
    const regionType = searchParams.get('region_type');
    const includeMarkets = searchParams.get('include_markets') === 'true';
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('regions')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .range(offset, offset + limit - 1);

    // Apply filters
    if (country) {
      query = query.eq('country', country);
    }

    if (regionType) {
      query = query.eq('region_type', regionType);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state_province.ilike.%${search}%`);
    }

    const { data: regions, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch regions' },
        { status: 500 }
      );
    }

    let responseData: any = {
      regions: regions || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    };

    // Include markets if requested
    if (includeMarkets && regions && regions.length > 0) {
      const regionIds = regions.map(r => r.id);
      const { data: markets } = await supabase
        .from('markets')
        .select('*')
        .in('region_id', regionIds)
        .eq('is_active', true)
        .order('name');

      // Group markets by region
      const marketsByRegion = new Map();
      markets?.forEach(market => {
        if (!marketsByRegion.has(market.region_id)) {
          marketsByRegion.set(market.region_id, []);
        }
        marketsByRegion.get(market.region_id).push(market);
      });

      // Add markets to regions
      responseData.regions = regions.map(region => ({
        ...region,
        markets: marketsByRegion.get(region.id) || []
      }));
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new region
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

    // Validate required fields
    if (!body.name || !body.country || !body.region_type) {
      return NextResponse.json(
        { error: 'Name, country, and region type are required' },
        { status: 400 }
      );
    }

    // Create the region
    const regionData = {
      name: body.name,
      country: body.country,
      state_province: body.state_province,
      city: body.city,
      region_type: body.region_type,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      population: body.population ? parseInt(body.population) : null,
      economic_indicators: body.economic_indicators,
      climate_zone: body.climate_zone,
      parent_region_id: body.parent_region_id,
      is_active: body.is_active !== undefined ? body.is_active : true
    };

    const { data: result, error } = await supabase
      .from('regions')
      .insert([regionData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create region' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      region: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating region:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 