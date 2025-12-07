import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get counts for each status
        const [pendingResult, approvedResult, rejectedResult, suspendedResult, totalResult] = await Promise.all([
            supabase.from('trade_vendors').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('trade_vendors').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
            supabase.from('trade_vendors').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
            supabase.from('trade_vendors').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
            supabase.from('trade_vendors').select('id', { count: 'exact', head: true }),
        ]);

        // Get featured vendors count
        const { count: featuredCount } = await supabase
            .from('trade_vendors')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'approved')
            .eq('is_featured', true);

        // Get recent applications (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: recentCount } = await supabase
            .from('trade_vendors')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString());

        return NextResponse.json({
            pending: pendingResult.count || 0,
            approved: approvedResult.count || 0,
            rejected: rejectedResult.count || 0,
            suspended: suspendedResult.count || 0,
            total: totalResult.count || 0,
            featured: featuredCount || 0,
            recentApplications: recentCount || 0
        });
    } catch (error) {
        console.error('Trade stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
