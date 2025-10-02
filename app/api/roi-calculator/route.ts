import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Retrieve ROI calculations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
    }

    const isPublic = searchParams.get('public') === 'true';
    const calculationType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('roi_calculations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (isPublic) {
      query = query.eq('is_public', true);
    } else if (user) {
      // Show user's own calculations and public ones
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
    } else {
      // Show only public calculations for non-authenticated users
      query = query.eq('is_public', true);
    }

    if (calculationType) {
      query = query.eq('calculation_type', calculationType);
    }

    const { data: calculations, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calculations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      calculations: calculations || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching ROI calculations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculations' },
      { status: 500 }
    );
  }
}

// POST - Create new ROI calculation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.title || !body.calculationType) {
      return NextResponse.json(
        { error: 'Title and calculation type are required' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create the calculation document
    const calculationData = {
      title: body.title,
      calculation_type: body.calculationType,
      user_id: user.id,
      user_email: user.email,
      is_public: body.isPublic || false,
      description: body.description,
      location: body.location,
      currency: body.currency || 'USD',
      timeframe: body.timeframe,
      crop_details: body.cropDetails,
      livestock_details: body.livestockDetails,
      costs: body.costs,
      revenue: body.revenue,
      calculations: body.calculations,
      scenarios: body.scenarios,
      tags: body.tags || [],
      notes: body.notes,
      attachments: body.attachments || [],
      shared_with: body.sharedWith || [],
    };

    const { data: result, error } = await supabase
      .from('roi_calculations')
      .insert([calculationData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create calculation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      calculation: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating ROI calculation:', error);
    return NextResponse.json(
      { error: 'Failed to create calculation' },
      { status: 500 }
    );
  }
}

// PUT - Update existing ROI calculation
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
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

    // Update the calculation (only if user owns it)
    const { data: result, error } = await supabase
      .from('roi_calculations')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the calculation
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update calculation' },
        { status: 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Calculation not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      calculation: result
    });

  } catch (error) {
    console.error('Error updating ROI calculation:', error);
    return NextResponse.json(
      { error: 'Failed to update calculation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ROI calculation
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
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

    // Delete the calculation (only if user owns it)
    const { error } = await supabase
      .from('roi_calculations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the calculation

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete calculation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Calculation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting ROI calculation:', error);
    return NextResponse.json(
      { error: 'Failed to delete calculation' },
      { status: 500 }
    );
  }
} 