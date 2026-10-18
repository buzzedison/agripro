import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { pageOptions, searchPattern, literalPattern } from "@/lib/marketplace";
import { withReviewSummary } from "@/lib/marketplace-reputation";
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(),
      params = request.nextUrl.searchParams;
    const { page, limit, offset } = pageOptions(params);
    let query = supabase
      .from("trade_vendors")
      .select(
        "id,business_name,owner_name,business_type,product_description,logo_url,cover_image_url,country,region,city,is_featured,is_verified,rating,total_reviews,slug,created_at",
        { count: "exact" },
      )
      .eq("status", "approved");
    if (params.get("search")?.trim()) {
      const pattern = searchPattern(params.get("search")!);
      query = query.or(
        [
          "business_name",
          "product_description",
          "owner_name",
          "city",
          "region",
          "country",
          "business_type",
        ]
          .map((field) => `${field}.ilike.${pattern}`)
          .join(","),
      );
    }
    if (params.get("category"))
      query = query.eq("business_type", params.get("category"));
    if (params.get("country")?.trim())
      query = query.ilike("country", literalPattern(params.get("country")!));
    if (params.get("verified") === "true")
      query = query.eq("is_verified", true);
    if (params.get("featured") === "true")
      query = query.eq("is_featured", true);
    const { data, error, count } = await query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return NextResponse.json({
      vendors: await withReviewSummary(supabase, data || []),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Marketplace sellers:", error);
    return NextResponse.json(
      { error: "Could not load sellers. Please try again." },
      { status: 500 },
    );
  }
}
