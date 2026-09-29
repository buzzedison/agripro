import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  pageOptions,
  searchPattern,
  vendorDocumentPath,
} from "@/lib/marketplace";

// GET: List all vendors with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin, error: adminError } =
      await supabase.rpc("is_admin_user");
    if (adminError || !admin)
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const { page, limit, offset } = pageOptions(searchParams, 20);

    // Build query - use service role for admin access
    let query = supabase.from("trade_vendors").select("*", { count: "exact" });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `business_name.ilike.${searchPattern(search)},owner_name.ilike.${searchPattern(search)},email.ilike.${searchPattern(search)}`,
      );
    }

    // Apply pagination and ordering
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: vendors, error, count } = await query;

    if (error) {
      console.error("Error fetching vendors:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      vendors: await Promise.all(
        (vendors || []).map(async (vendor) => {
          const urls: Record<string, string | null> = {};
          for (const key of ["id_document_url", "business_document_url"]) {
            const path = vendorDocumentPath(vendor[key], vendor.id);
            const { data } = path
              ? await supabase.storage
                  .from("vendor-documents")
                  .createSignedUrl(path, 300)
              : { data: null };
            urls[key] = data?.signedUrl || null;
          }
          return { ...vendor, ...urls };
        }),
      ),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Vendors API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH: Update vendor status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin, error: adminError } =
      await supabase.rpc("is_admin_user");
    if (adminError || !admin)
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    const body = await request.json();
    const { vendorId, status, adminNotes, rejectionReason } = body;

    if (!vendorId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["pending", "approved", "rejected", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await supabase.rpc("review_trade_vendor", {
      p_vendor: vendorId,
      p_status: status,
      p_verify: body.verify === true,
      p_notes: adminNotes || null,
      p_reason: rejectionReason || null,
      p_expected_updated_at: body.expectedVersion || null,
    });

    if (error) {
      console.error("Error updating vendor:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Send email notification to vendor about status change

    return NextResponse.json({ message: `Vendor ${status} successfully` });
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
