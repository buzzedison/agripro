import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Retrieve price records with filtering and analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get('product_id');
    const regionId = searchParams.get('region_id');
    const marketId = searchParams.get('market_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const priceType = searchParams.get('price_type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeAnalytics = searchParams.get('include_analytics') === 'true';

    // Build base query with joins
    let query = supabase
      .from('price_records')
      .select(`
        *,
        agricultural_products!inner(id, name, category, unit_of_measurement),
        markets!inner(id, name, market_type),
        regions!inner(id, name, country, state_province)
      `)
      .eq('verification_status', 'verified')
      .order('price_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    if (marketId) {
      query = query.eq('market_id', marketId);
    }

    if (startDate) {
      query = query.gte('price_date', startDate);
    }

    if (endDate) {
      query = query.lte('price_date', endDate);
    }

    if (priceType) {
      query = query.eq('price_type', priceType);
    }

    const { data: prices, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch price records' },
        { status: 500 }
      );
    }

    let analytics = null;
    if (includeAnalytics && productId) {
      // Get price analytics for the product
      const { data: analyticsData } = await supabase
        .from('price_analytics')
        .select('*')
        .eq('product_id', productId)
        .eq('region_id', regionId || '')
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      analytics = analyticsData;
    }

    return NextResponse.json({
      prices: prices || [],
      analytics,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching price records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new price record
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

    // Validate required fields
    if (!body.product_id || !body.market_id || !body.region_id || 
        !body.price_date || !body.price_per_unit || !body.price_type) {
      return NextResponse.json(
        { error: 'Product ID, market ID, region ID, price date, price per unit, and price type are required' },
        { status: 400 }
      );
    }

    // Create the price record
    const priceData = {
      product_id: body.product_id,
      market_id: body.market_id,
      region_id: body.region_id,
      price_date: body.price_date,
      price_per_unit: parseFloat(body.price_per_unit),
      currency: body.currency || 'USD',
      quality_grade: body.quality_grade,
      quantity_available: body.quantity_available ? parseFloat(body.quantity_available) : null,
      price_type: body.price_type,
      source: body.source || 'manual',
      source_url: body.source_url,
      reliability_score: body.reliability_score || 3,
      notes: body.notes,
      created_by: user.id,
      verification_status: 'pending'
    };

    const { data: result, error } = await supabase
      .from('price_records')
      .insert([priceData])
      .select(`
        *,
        agricultural_products!inner(id, name, category, unit_of_measurement),
        markets!inner(id, name, market_type),
        regions!inner(id, name, country, state_province)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Price record already exists for this product, market, date, and price type' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create price record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      price_record: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating price record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing price record
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Price record ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user owns this record or has admin privileges
    const { data: existingRecord } = await supabase
      .from('price_records')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existingRecord || existingRecord.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own price records' },
        { status: 403 }
      );
    }

    // Update the price record
    const { data: result, error } = await supabase
      .from('price_records')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        agricultural_products!inner(id, name, category, unit_of_measurement),
        markets!inner(id, name, market_type),
        regions!inner(id, name, country, state_province)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update price record' },
        { status: 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Price record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      price_record: result
    });

  } catch (error) {
    console.error('Error updating price record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete price record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Price record ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user owns this record
    const { data: existingRecord } = await supabase
      .from('price_records')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existingRecord || existingRecord.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own price records' },
        { status: 403 }
      );
    }

    // Delete the price record
    const { error } = await supabase
      .from('price_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete price record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Price record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting price record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 