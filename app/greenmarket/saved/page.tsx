"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Loader2, Package, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { productPrice } from "@/lib/marketplace";

type SavedRow = {
  id: string;
  notify: boolean;
  created_at: string;
  product_id: string | null;
  vendor_id: string | null;
  product: { name: string; slug: string; price: number | null; currency: string | null; unit: string | null; images: string[] | null; stock_status: string; vendor: { business_name: string } | null } | null;
  vendor: { business_name: string; slug: string; logo_url: string | null; city: string | null; country: string | null } | null;
};

const STOCK: Record<string, string> = { in_stock: "In stock", low_stock: "Low stock", out_of_stock: "Out of stock" };

export default function SavedPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SavedRow[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"products" | "suppliers">("products");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace(`/auth/login?redirectTo=${encodeURIComponent("/greenmarket/saved")}`);
      return;
    }
    // Joined listings are filtered by marketplace visibility, so removed items come back as null.
    const { data, error } = await supabase
      .from("trade_saved_items")
      .select("id, notify, created_at, product_id, vendor_id, product:trade_products(name, slug, price, currency, unit, images, stock_status, vendor:trade_vendors(business_name)), vendor:trade_vendors(business_name, slug, logo_url, city, country)")
      .order("created_at", { ascending: false });
    if (error) setError("Could not load your saved items. Please try again.");
    else setRows(data as unknown as SavedRow[]);
  }, [router]);
  useEffect(() => { void load(); }, [load]);

  const toggleNotify = async (row: SavedRow) => {
    const { error } = await createClient().from("trade_saved_items").update({ notify: !row.notify }).eq("id", row.id);
    if (error) { toast.error("Could not update alerts."); return; }
    setRows((r) => r?.map((x) => (x.id === row.id ? { ...x, notify: !x.notify } : x)) || null);
    toast.success(row.notify ? "Alerts off" : "Alerts on");
  };
  const remove = async (row: SavedRow) => {
    const { error } = await createClient().from("trade_saved_items").delete().eq("id", row.id);
    if (error) { toast.error("Could not remove this item."); return; }
    setRows((r) => r?.filter((x) => x.id !== row.id) || null);
  };

  const products = rows?.filter((r) => r.product_id) || [];
  const suppliers = rows?.filter((r) => r.vendor_id) || [];
  const list = tab === "products" ? products : suppliers;

  const actions = (row: SavedRow) => (
    <div className="flex shrink-0 items-center gap-1">
      <button onClick={() => toggleNotify(row)} title={row.notify ? "Turn alerts off" : "Turn alerts on"} aria-label={row.notify ? "Turn alerts off" : "Turn alerts on"}
        className={`rounded-lg p-2 ${row.notify ? "text-green-700 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
        {row.notify ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </button>
      <button onClick={() => remove(row)} aria-label="Remove from saved" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-16 pt-24">
      <div className="mx-auto max-w-4xl px-4">
        <Link href="/greenmarket/marketplace" className="text-sm text-gray-500 hover:text-green-700">← Marketplace</Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Saved</h1>
        <p className="mt-1 text-sm text-gray-600">With alerts on, we&apos;ll notify you when a saved product is back in stock or drops in price, and when a saved supplier lists something new.</p>

        <div className="mt-5 flex gap-2">
          {([["products", "Products", Package, products.length], ["suppliers", "Suppliers", Store, suppliers.length]] as const).map(([value, label, Icon, count]) => (
            <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-emerald-700 text-white" : "border bg-white text-gray-700"}`}>
              <Icon size={16} /> {label} {rows && <span className="opacity-70">{count}</span>}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {error ? (
            <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error} <button onClick={load} className="ml-2 font-semibold underline">Retry</button></div>
          ) : !rows ? (
            <div role="status" className="flex items-center justify-center gap-2 rounded-xl bg-white p-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : list.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-500">
              Nothing saved yet. Tap <strong>Save</strong> on a {tab === "products" ? "product" : "supplier"} to keep it here.
              <div className="mt-3"><Link href={`/greenmarket/marketplace${tab === "suppliers" ? "?tab=suppliers" : ""}`} className="font-semibold text-green-700 underline">Browse the marketplace</Link></div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-sm">
              {list.map((row) => {
                if (tab === "products") {
                  const p = row.product;
                  return (
                    <li key={row.id} className="flex items-center gap-3 p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {p?.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        {p ? (
                          <>
                            <Link href={`/greenmarket/products/${p.slug}`} className="font-semibold text-gray-900 hover:underline">{p.name}</Link>
                            <p className="text-sm text-gray-600">{productPrice(p.price, p.currency || "GHS", p.unit || undefined)}</p>
                            <p className="text-xs text-gray-500">{p.vendor?.business_name} · <span className={p.stock_status === "out_of_stock" ? "text-red-600" : ""}>{STOCK[p.stock_status] || p.stock_status}</span></p>
                          </>
                        ) : <p className="text-sm text-gray-500">This listing is no longer available.</p>}
                      </div>
                      {actions(row)}
                    </li>
                  );
                }
                const v = row.vendor;
                return (
                  <li key={row.id} className="flex items-center gap-3 p-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-bold text-gray-400">
                      {v?.logo_url ? <img src={v.logo_url} alt="" className="h-full w-full object-cover" /> : v?.business_name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      {v ? (
                        <>
                          <Link href={`/greenmarket/vendors/${v.slug}`} className="font-semibold text-gray-900 hover:underline">{v.business_name}</Link>
                          <p className="text-xs text-gray-500">{[v.city, v.country].filter(Boolean).join(", ")}</p>
                        </>
                      ) : <p className="text-sm text-gray-500">This supplier is no longer listed.</p>}
                    </div>
                    {actions(row)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
