import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Retrieve user alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const alertType = searchParams.get('alert_type');
    const productId = searchParams.get('product_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('market_alerts')
      .select(`
        *,
        agricultural_products!inner(id, name, category, unit_of_measurement),
        regions(id, name, country, state_province)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (alertType) {
      query = query.eq('alert_type', alertType);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: alerts, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      alerts: alerts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new alert
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
    if (!body.product_id || !body.alert_type) {
      return NextResponse.json(
        { error: 'Product ID and alert type are required' },
        { status: 400 }
      );
    }

    // Validate threshold requirements based on alert type
    if (body.alert_type === 'price_threshold' && !body.threshold_price && !body.threshold_percentage) {
      return NextResponse.json(
        { error: 'Price threshold or percentage threshold is required for price alerts' },
        { status: 400 }
      );
    }

    // Create the alert
    const alertData = {
      user_id: user.id,
      product_id: body.product_id,
      region_id: body.region_id || null,
      alert_type: body.alert_type,
      threshold_price: body.threshold_price || null,
      threshold_percentage: body.threshold_percentage || null,
      condition_operator: body.condition_operator || 'greater_than',
      is_active: body.is_active !== undefined ? body.is_active : true,
      notification_methods: body.notification_methods || ['in_app'],
      frequency: body.frequency || 'immediate',
      trigger_count: 0
    };

    const { data: result, error } = await supabase
      .from('market_alerts')
      .insert([alertData])
      .select(`
        *,
        agricultural_products!inner(id, name, category, unit_of_measurement),
        regions(id, name, country, state_province)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing alert
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
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

    // Update the alert (only if user owns it)
    const { data: result, error } = await supabase
      .from('market_alerts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        agricultural_products!inner(id, name, category, unit_of_measurement),
        regions(id, name, country, state_province)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Alert not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: result
    });

  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete alert
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
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

    // Delete the alert (only if user owns it)
    const { error } = await supabase
      .from('market_alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Trigger alert (for testing or manual triggering)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Alert ID and action are required' },
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

    if (action === 'trigger') {
      // First get the current alert to increment trigger count
      const { data: currentAlert, error: fetchError } = await supabase
        .from('market_alerts')
        .select('trigger_count')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !currentAlert) {
        return NextResponse.json(
          { error: 'Alert not found or access denied' },
          { status: 404 }
        );
      }

      // Increment trigger count and update last triggered time
      const { data: result, error } = await supabase
        .from('market_alerts')
        .update({
          trigger_count: (currentAlert.trigger_count || 0) + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to trigger alert' },
          { status: 500 }
        );
      }

      if (!result) {
        return NextResponse.json(
          { error: 'Alert not found or access denied' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Alert triggered successfully',
        alert: result
      });
    }

    else if (action === 'reset') {
      // Reset trigger count
      const { data: result, error } = await supabase
        .from('market_alerts')
        .update({
          trigger_count: 0,
          last_triggered_at: null
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to reset alert' },
          { status: 500 }
        );
      }

      if (!result) {
        return NextResponse.json(
          { error: 'Alert not found or access denied' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Alert reset successfully',
        alert: result
      });
    }

    else {
      return NextResponse.json(
        { error: 'Invalid action. Use "trigger" or "reset"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing alert action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 