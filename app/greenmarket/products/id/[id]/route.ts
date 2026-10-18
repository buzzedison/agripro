import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Notifications store product ids; this resolves one to its public page.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fallback = new URL("/greenmarket/saved", request.url);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.redirect(fallback);
  const supabase = await createClient();
  const { data } = await supabase.from("trade_products").select("slug").eq("id", id).maybeSingle();
  return NextResponse.redirect(data?.slug ? new URL(`/greenmarket/products/${data.slug}`, request.url) : fallback);
}
