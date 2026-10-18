"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Target = { productId: string; vendorId?: never } | { vendorId: string; productId?: never };

/** Save a product (alerts on restock and price drops) or a supplier (alerts on new listings). */
export default function SaveButton({ returnTo, compact, ...target }: Target & { returnTo: string; compact?: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const column = target.productId ? "product_id" : "vendor_id";
  const id = (target.productId || target.vendorId)!;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from("trade_saved_items").select("id").eq(column, id).maybeSingle();
        setSaved(!!data);
      }
      setReady(true);
    });
  }, [column, id]);

  const toggle = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    setBusy(true);
    const { error } = saved
      ? await supabase.from("trade_saved_items").delete().eq(column, id)
      : await supabase.from("trade_saved_items").insert({ user_id: user.id, [column]: id });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("500") ? error.message : "Could not update your saved items.");
      return;
    }
    setSaved(!saved);
    toast.success(saved ? "Removed from saved" : target.productId ? "Saved. We'll let you know when it's back in stock or the price drops." : "Saved. We'll let you know when this supplier lists something new.");
  };

  const Icon = busy ? Loader2 : saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready || busy}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${saved ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
    >
      <Icon className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
      {compact ? null : saved ? "Saved" : target.productId ? "Save" : "Save supplier"}
    </button>
  );
}
