import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/members
 * Fetch all members/profiles for admin view
 * Uses service role to bypass RLS and see all profiles
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status'); // 'complete', 'incomplete', 'all'
        const search = searchParams.get('search');
        const userType = searchParams.get('user_type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Use service role client to bypass RLS
        const { createClient: createServiceClient } = await import('@supabase/supabase-js');
        const serviceSupabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Build query
        let query = serviceSupabase
            .from('profiles')
            .select('*', { count: 'exact' });

        // Apply filters
        if (status === 'complete') {
            query = query.eq('profile_complete', true);
        } else if (status === 'incomplete') {
            query = query.eq('profile_complete', false);
        }

        if (userType && userType !== 'all') {
            query = query.eq('user_type', userType);
        }

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,organization_name.ilike.%${search}%`);
        }

        // Apply pagination and ordering
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: profiles, error, count } = await query;

        if (error) {
            console.error('Error fetching profiles:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get stats
        const [totalRes, completeRes, incompleteRes] = await Promise.all([
            serviceSupabase.from('profiles').select('id', { count: 'exact', head: true }),
            serviceSupabase.from('profiles').select('id', { count: 'exact', head: true }).eq('profile_complete', true),
            serviceSupabase.from('profiles').select('id', { count: 'exact', head: true }).eq('profile_complete', false),
        ]);

        return NextResponse.json({
            profiles,
            stats: {
                total: totalRes.count || 0,
                complete: completeRes.count || 0,
                incomplete: incompleteRes.count || 0,
            },
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Members API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
