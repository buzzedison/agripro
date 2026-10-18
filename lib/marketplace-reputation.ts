import type { SupabaseClient } from "@supabase/supabase-js";

export type ReviewSummaryRow = { vendor_id: string; average: number; total: number; would_trade_again_pct: number | null };

/**
 * Seller ratings come from real buyer reviews (vendor_review_summary), not from the
 * protected rating/total_reviews columns. Overlays them on any list of vendors.
 */
export async function withReviewSummary<T extends { id: string; rating?: number | null; total_reviews?: number | null }>(
  supabase: SupabaseClient,
  vendors: T[],
): Promise<T[]> {
  if (vendors.length === 0) return vendors;
  const { data, error } = await supabase.rpc("vendor_review_summary", { p_vendor_ids: vendors.map((v) => v.id) });
  if (error) return vendors; // before migration 065: keep existing values
  const byVendor = new Map((data as ReviewSummaryRow[]).map((r) => [r.vendor_id, r]));
  return vendors.map((v) => {
    const s = byVendor.get(v.id);
    return { ...v, rating: s ? Number(s.average) : 0, total_reviews: s ? s.total : 0 };
  });
}
