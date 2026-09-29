import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { pageOptions, literalPattern, searchPattern } from "@/lib/marketplace";
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams,
      supabase = await createClient();
    const { page, limit, offset } = pageOptions(params);
    const empty = {
      products: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
    let query = supabase
      .from("trade_products")
      .select(
        "id,name,slug,description,price,currency,unit,min_order_quantity,images,stock_status,is_organic,created_at,updated_at,vendor:trade_vendors!inner(id,business_name,slug,is_verified,logo_url,country,city,status),category:trade_categories(id,name,slug)",
        { count: "exact" },
      )
      .eq("is_active", true)
      .eq("vendor.status", "approved");
    if (params.get("search")?.trim()) {
      const pattern = searchPattern(params.get("search")!);
      query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`);
    }
    if (params.get("category")) {
      const category = params.get("category")!;
      if (/^[0-9a-f-]{36}$/i.test(category))
        query = query.eq("category_id", category);
      else {
        const { data, error } = await supabase
          .from("trade_categories")
          .select("id")
          .eq("slug", category)
          .eq("is_active", true)
          .maybeSingle();
        if (error) throw error;
        if (!data) return NextResponse.json(empty);
        query = query.eq("category_id", data.id);
      }
    }
    if (params.get("vendor"))
      query = query.eq("vendor.slug", params.get("vendor"));
    if (params.get("country")?.trim())
      query = query.ilike(
        "vendor.country",
        literalPattern(params.get("country")!),
      );
    if (params.get("verified") === "true")
      query = query.eq("vendor.is_verified", true);
    if (params.get("featured") === "true")
      query = query.eq("is_featured", true);
    if (params.get("stock") === "available")
      query = query.in("stock_status", ["in_stock", "low_stock"]);
    // Prices are comparable only within a selected currency.
    const currency = params.get("currency");
    if (currency && !/^[A-Z]{3}$/.test(currency))
      return NextResponse.json(
        { error: "Choose a valid currency." },
        { status: 400 },
      );
    if (currency) query = query.eq("currency", currency);
    for (const key of ["min", "max"] as const)
      if (params.get(key)) {
        const value = Number(params.get(key));
        if (!currency || !Number.isFinite(value) || value < 0)
          return NextResponse.json(
            { error: "Choose a currency and a valid price range." },
            { status: 400 },
          );
        query =
          key === "min" ? query.gte("price", value) : query.lte("price", value);
      }
    if (
      params.get("min") &&
      params.get("max") &&
      Number(params.get("min")) > Number(params.get("max"))
    )
      return NextResponse.json(
        { error: "Minimum price must not exceed maximum price." },
        { status: 400 },
      );
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return NextResponse.json({
      products: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Marketplace products:", error);
    return NextResponse.json(
      { error: "Could not load products. Please try again." },
      { status: 500 },
    );
  }
}
