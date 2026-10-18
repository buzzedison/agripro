"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Counts one view per product per browser session for seller insights. Stores no visitor identity.
export default function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `gm-viewed:${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable: still count once per page load */
    }
    createClient().rpc("record_product_view", { p_product: productId }).then(() => {});
  }, [productId]);
  return null;
}
