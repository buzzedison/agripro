"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bookmark, Clock, Eye, Loader2, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "../../components/VendorReviews";

type Insights = {
  period_days: number;
  products: { id: string; name: string; slug: string; stock_status: string; is_active: boolean; views: number; saves: number; enquiries: number; enquiries_total: number }[];
  totals: { views: number; product_saves: number; supplier_saves: number; enquiries: number; replied: number; replied_within_day: number; median_reply_hours: number | null; awaiting_reply: number };
  reviews: { average: number | null; total: number };
  daily: { day: string; views: number; enquiries: number }[];
};
type MyReview = { id: string; rating: number; body: string; would_trade_again: boolean | null; reviewer: string; product_name: string | null; seller_response: string | null; hidden: boolean; created_at: string };

const PERIODS = [7, 30, 90];
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);
const replyTime = (h: number | null) => (h == null ? "—" : h < 1 ? "Under 1 hour" : h < 24 ? `${Math.round(h)} hours` : `${Math.round(h / 24)} days`);

export default function SellerInsights() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Insights | null>(null);
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    const supabase = createClient();
    const [ins, rev] = await Promise.all([supabase.rpc("vendor_insights", { p_days: days }), supabase.rpc("my_vendor_reviews")]);
    if (ins.error) { setError(ins.error.message.includes("seller profile") ? "Insights are available once you have a seller profile." : "Could not load your insights. Please try again."); return; }
    setData(ins.data as Insights);
    setReviews((rev.data || []) as MyReview[]);
  }, [days]);
  useEffect(() => { void load(); }, [load]);

  const respond = async (review: MyReview, text: string | null) => {
    setBusy(review.id);
    const { error } = await createClient().rpc("respond_trade_review", { p_review: review.id, p_response: text });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    setReviews((r) => r.map((x) => (x.id === review.id ? { ...x, seller_response: text } : x)));
    setDrafts((d) => { const n = { ...d }; delete n[review.id]; return n; });
    toast.success(text ? "Response published" : "Response removed");
  };

  if (error) return <div className="p-6"><div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error} <button onClick={load} className="ml-2 font-semibold underline">Retry</button></div></div>;
  if (!data) return <div className="flex items-center justify-center gap-2 p-16 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading insights…</div>;

  const t = data.totals;
  const responseRate = pct(t.replied, t.enquiries);
  const maxViews = Math.max(1, ...data.daily.map((d) => d.views));
  const tiles = [
    { icon: Eye, label: "Product views", value: t.views.toLocaleString(), hint: `Last ${data.period_days} days` },
    { icon: MessageSquare, label: "Quote requests", value: t.enquiries, hint: t.views ? `${pct(t.enquiries, t.views)}% of views` : "" },
    { icon: Clock, label: "Typical reply time", value: replyTime(t.median_reply_hours), hint: responseRate == null ? "No requests yet" : `${responseRate}% answered · ${pct(t.replied_within_day, t.enquiries)}% within a day` },
    { icon: Bookmark, label: "Saves", value: t.product_saves + t.supplier_saves, hint: `${t.product_saves} products · ${t.supplier_saves} following you` },
    { icon: Star, label: "Rating", value: data.reviews.total ? Number(data.reviews.average).toFixed(1) : "—", hint: `${data.reviews.total} review${data.reviews.total === 1 ? "" : "s"}` },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-sm text-gray-500">How buyers find and contact you. Views count one visit per buyer session and exclude your own.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-gray-100 p-1" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setDays(p)} aria-pressed={days === p} className={`rounded-full px-3 py-1.5 text-sm font-medium ${days === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>{p} days</button>
          ))}
        </div>
      </div>

      {t.awaiting_reply > 0 && (
        <Link href="/feed/enquiries" className="block rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100">
          <strong>{t.awaiting_reply} quote request{t.awaiting_reply === 1 ? "" : "s"}</strong> still waiting for your first reply. Buyers who hear back quickly are more likely to buy — reply now →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {tiles.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Icon className="h-3.5 w-3.5" /> {label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {hint && <p className="mt-0.5 text-[11px] text-gray-500">{hint}</p>}
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="font-semibold text-gray-900">Daily views and quote requests</h2>
        <div className="mt-4 flex h-36 items-end gap-[2px]" role="img" aria-label={`Daily views over the last ${data.period_days} days, peaking at ${maxViews}`}>
          {data.daily.map((d) => (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${new Date(d.day).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${d.views} views, ${d.enquiries} requests`}>
              <div className="w-full rounded-t-sm bg-emerald-500/80 group-hover:bg-emerald-600" style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: d.views ? 2 : 0 }} />
              {d.enquiries > 0 && <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500" />}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-gray-400">
          <span>{data.daily[0] && new Date(data.daily[0].day).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
          <span className="flex items-center gap-3"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Views</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Quote request</span></span>
          <span>Today</span>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-3 font-semibold text-gray-900">Products</h2>
        {data.products.length === 0 ? <p className="text-sm text-gray-500">No products yet. <Link href="/greenmarket/products/new" className="font-semibold text-green-700 underline">Add your first product</Link>.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr><th className="py-2 pr-3">Product</th><th className="py-2 pr-3 text-right">Views</th><th className="py-2 pr-3 text-right">Requests</th><th className="py-2 pr-3 text-right">Request rate</th><th className="py-2 text-right">Saves</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-3">
                      <Link href={`/greenmarket/products/${p.slug}`} className="font-medium text-gray-900 hover:underline">{p.name}</Link>
                      <p className="text-xs text-gray-500">{!p.is_active ? "Hidden" : p.stock_status === "out_of_stock" ? "Out of stock" : p.stock_status === "low_stock" ? "Low stock" : "In stock"} · {p.enquiries_total} requests all time</p>
                    </td>
                    <td className="py-2.5 pr-3 text-right">{p.views}</td>
                    <td className="py-2.5 pr-3 text-right">{p.enquiries}</td>
                    <td className="py-2.5 pr-3 text-right text-gray-600">{p.views ? `${pct(p.enquiries, p.views)}%` : "—"}</td>
                    <td className="py-2.5 text-right">{p.saves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">Products with views but few requests may need clearer photos, a price, or a lower minimum order.</p>
      </section>

      <section id="reviews" className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="font-semibold text-gray-900">Reviews</h2>
        <p className="mb-3 text-sm text-gray-500">Buyers can review you after a quote conversation you&apos;ve replied to. A short, polite public reply builds trust, even to a critical review.</p>
        {reviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : (
          <ul className="divide-y divide-gray-100">
            {reviews.map((r) => {
              const draft = drafts[r.id];
              return (
                <li key={r.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><Stars value={r.rating} /><span className="text-sm font-semibold">{r.reviewer}</span>{r.product_name && <span className="text-xs text-gray-500">· {r.product_name}</span>}</span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  {r.hidden && <p className="mt-1 text-xs font-semibold text-amber-700">Hidden by a moderator — not shown publicly.</p>}
                  <p className="mt-1.5 whitespace-pre-line text-sm text-gray-700">{r.body}</p>
                  {draft !== undefined ? (
                    <div className="mt-2">
                      <textarea value={draft} onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })} rows={3} maxLength={1000} aria-label="Your public response"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" placeholder="Thank the buyer and address any concerns." />
                      <div className="mt-1.5 flex gap-2">
                        <button disabled={busy === r.id || draft.trim().length < 2} onClick={() => respond(r, draft.trim())} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Publish response</button>
                        <button onClick={() => setDrafts((d) => { const n = { ...d }; delete n[r.id]; return n; })} className="px-2 text-sm text-gray-500">Cancel</button>
                      </div>
                    </div>
                  ) : r.seller_response ? (
                    <div className="mt-2 rounded-lg border-l-2 border-green-500 bg-green-50/60 px-3 py-2 text-sm text-gray-700">
                      <p className="text-xs font-semibold text-green-800">Your response</p>
                      <p className="whitespace-pre-line">{r.seller_response}</p>
                      <div className="mt-1 flex gap-3 text-xs">
                        <button onClick={() => setDrafts({ ...drafts, [r.id]: r.seller_response || "" })} className="font-medium text-green-700">Edit</button>
                        <button disabled={busy === r.id} onClick={() => confirm("Remove your response?") && respond(r, null)} className="text-gray-500">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setDrafts({ ...drafts, [r.id]: "" })} className="mt-2 text-sm font-medium text-green-700">Reply publicly</button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
