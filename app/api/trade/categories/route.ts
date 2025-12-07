import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: List all active categories
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: categories, error } = await supabase
            .from('trade_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Categories API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
