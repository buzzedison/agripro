import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category'); // slug or id? let's support slug if possible, or id.
        // Actually, the frontend uses business types ids like 'organic-farm'.
        // For products, I'll need actual category IDs or slugs.
        // Let's assume category ID for now, or join with categories table to filter by slug.
        // To be safe, I'll fetch category by slug if it looks like a slug.

        const featured = searchParams.get('featured') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');
        const supabase = await createClient();

        let query = supabase
            .from('trade_products')
            .select(`
                *,
                vendor:trade_vendors(
                    id,
                    business_name,
                    slug,
                    is_verified,
                    logo_url
                ),
                category:trade_categories(
                    id,
                    name,
                    slug
                )
            `)
            .eq('is_active', true);

        if (featured) {
            // query = query.eq('is_featured', true); // If we had is_featured on products
            // Assuming we don't, or maybe we do? Migration 005 said `is_featured BOOLEAN DEFAULT false`.
            query = query.eq('is_featured', true);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        if (category) {
            // If category param is provided
            // It might be a slug from the UI pills.
            // Check if it's a UUID
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);

            if (isUUID) {
                query = query.eq('category_id', category);
            } else {
                // It's a slug, we need to filter on the joined category table
                // Supabase allow filtering on joined tables?
                // query = query.eq('category.slug', category) -> This syntax works in some clients but for Postgrest JS:
                // .eq('trade_categories.slug', category) might work if we select it?
                // Actually, inner join filtering is tricky.
                // Alternative: Fetch category ID first.

                const { data: catData } = await supabase
                    .from('trade_categories')
                    .select('id')
                    .eq('slug', category)
                    .single();

                if (catData) {
                    query = query.eq('category_id', catData.id);
                }
            }
        }

        query = query.order('created_at', { ascending: false }).limit(limit);

        const { data: products, error } = await query;

        if (error) throw error;

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
