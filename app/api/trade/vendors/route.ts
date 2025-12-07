import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: List approved vendors for public marketplace
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const offset = (page - 1) * limit;

        // Build query for approved vendors only
        let query = supabase
            .from('trade_vendors')
            .select('id, business_name, owner_name, business_type, product_description, logo_url, cover_image_url, country, region, city, is_featured, is_verified, rating, total_reviews, slug, created_at', { count: 'exact' })
            .eq('status', 'approved');

        // Apply filters
        if (search) {
            query = query.or(`business_name.ilike.%${search}%,product_description.ilike.%${search}%`);
        }

        if (category) {
            query = query.eq('business_type', category);
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        // Apply pagination and ordering
        query = query
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: vendors, error, count } = await query;

        if (error) {
            console.error('Error fetching public vendors:', error);
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
        console.error('Public vendors API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
