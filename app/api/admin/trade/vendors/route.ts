import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: List all vendors with optional filters
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Build query - use service role for admin access
        let query = supabase
            .from('trade_vendors')
            .select('*', { count: 'exact' });

        // Apply filters
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`business_name.ilike.%${search}%,owner_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply pagination and ordering
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: vendors, error, count } = await query;

        if (error) {
            console.error('Error fetching vendors:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            vendors,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Vendors API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update vendor status (approve/reject)
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { vendorId, status, adminNotes, rejectionReason } = body;

        if (!vendorId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updateData: any = {
            status,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
        };

        // Set verification fields for approved vendors
        // Set verification fields for approved vendors
        // Set verification fields for approved vendors
        if (body.verify === true) {
            updateData.verified_at = new Date().toISOString();
            updateData.verified_by = user.id;
            updateData.is_verified = true;
        } else if (status === 'approved') {
            // Approval grants posting rights but not verification badge
            // is_verified remains false until separate verification process
        } else if (status === 'rejected') {
            updateData.rejection_reason = rejectionReason;
            updateData.is_verified = false;
        } else if (status === 'suspended') {
            updateData.is_verified = false;
        }

        const { data: vendor, error } = await supabase
            .from('trade_vendors')
            .update(updateData)
            .eq('id', vendorId)
            .select()
            .single();

        if (error) {
            console.error('Error updating vendor:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // TODO: Send email notification to vendor about status change

        return NextResponse.json({ vendor, message: `Vendor ${status} successfully` });
    } catch (error) {
        console.error('Vendor update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
