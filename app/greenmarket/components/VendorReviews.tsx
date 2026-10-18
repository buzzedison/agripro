"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Flag, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ReportModal from "@/components/ReportModal";

export type PublicReview = {
  id: string;
  rating: number;
  body: string;
  would_trade_again: boolean | null;
  reviewer: string;
  reviewer_country: string | null;
  product_name: string | null;
  seller_response: string | null;
  seller_responded_at: string | null;
  created_at: string;
  updated_at: string;
};
export type ReviewSummary = { average: number; total: number; would_trade_again_pct: number | null } | null;
type MyStatus = { eligible: boolean; reason: string | null; review_id: string | null; rating: number | null; body: string | null; would_trade_again: boolean | null; hidden: boolean };

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} aria-hidden="true" />
      ))}
    </span>
  );
}

const date = (d: string) => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

export default function VendorReviews({ vendorId, slug, reviews: initial, summary, isOwner }: {
  vendorId: string;
  slug: string;
  reviews: PublicReview[];
  summary: ReviewSummary;
  isOwner: boolean;
}) {
  const [reviews] = useState(initial);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [status, setStatus] = useState<MyStatus | null>(null);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [again, setAgain] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setMe({ id: user.id });
      const { data } = await supabase.rpc("my_trade_review_status", { p_vendor: vendorId });
      const s = (data as MyStatus[] | null)?.[0] || null;
      setStatus(s);
      if (s?.review_id) {
        setRating(s.rating || 0);
        setBody(s.body || "");
        setAgain(s.would_trade_again);
      }
    });
  }, [vendorId, isOwner]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error("Choose a star rating."); return; }
    setBusy(true);
    const { error } = await createClient().rpc("submit_trade_review", { p_vendor: vendorId, p_rating: rating, p_body: body, p_would_trade_again: again });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(status?.review_id ? "Review updated." : "Thank you, your review is published.");
    setEditing(false);
    setStatus((s) => (s ? { ...s, review_id: s.review_id || "new", rating, body, would_trade_again: again } : s));
    // Refresh so the summary and list include the new review.
    window.location.reload();
  };

  const canWrite = !!status?.eligible && !status.hidden && (editing || !status.review_id);

  return (
    <section id="reviews" className="bg-white rounded-2xl shadow-sm p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Buyer reviews</h2>
          <p className="text-sm text-gray-500">Only buyers who requested a quote and got a reply from this supplier can leave a review.</p>
        </div>
        {summary && summary.total > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-2"><Stars value={Number(summary.average)} /><span className="text-lg font-bold text-gray-900">{Number(summary.average).toFixed(1)}</span></div>
            <p className="text-xs text-gray-500">{summary.total} review{summary.total === 1 ? "" : "s"}{summary.would_trade_again_pct != null ? ` · ${summary.would_trade_again_pct}% would trade again` : ""}</p>
          </div>
        )}
      </div>

      {isOwner && <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">This is your business. Reply to reviews from <Link href="/greenmarket/vendor-dashboard/insights#reviews" className="font-semibold text-green-700 underline">your insights page</Link>.</p>}

      {!isOwner && !me && (
        <p className="mb-4 text-sm text-gray-500"><Link href={`/auth/login?redirectTo=${encodeURIComponent(`/greenmarket/vendors/${slug}#reviews`)}`} className="font-semibold text-green-700 underline">Sign in</Link> to review a supplier you&apos;ve traded with.</p>
      )}
      {status && !status.eligible && status.reason && <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{status.reason}</p>}
      {status?.hidden && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">A moderator removed your review. Contact us if you think this was a mistake.</p>}
      {status?.review_id && !status.hidden && !editing && (
        <p className="mb-4 text-sm text-gray-600">You reviewed this supplier. <button onClick={() => setEditing(true)} className="font-semibold text-green-700 underline">Edit your review</button></p>
      )}

      {canWrite && (
        <form onSubmit={submit} className="mb-6 rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">{status?.review_id ? "Edit your review" : "How was trading with this supplier?"}</p>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} star${i === 1 ? "" : "s"}`} onClick={() => setRating(i)} className="p-0.5">
                <Star className={`h-7 w-7 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
              </button>
            ))}
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required minLength={20} maxLength={2000} rows={4}
            placeholder="What did you buy, and how were quality, communication, price and delivery?"
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
          <fieldset className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <legend className="sr-only">Would you trade with them again?</legend>
            <span>Would you trade with them again?</span>
            {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map((o) => (
              <label key={o.l} className="inline-flex items-center gap-1"><input type="radio" name="again" checked={again === o.v} onChange={() => setAgain(o.v)} /> {o.l}</label>
            ))}
          </fieldset>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {status?.review_id ? "Save changes" : "Publish review"}
            </button>
            {editing && <button type="button" onClick={() => setEditing(false)} className="px-3 py-2 text-sm text-gray-500">Cancel</button>}
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {reviews.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-sm font-semibold text-gray-900">{r.reviewer}</span>
                  {r.reviewer_country && <span className="text-xs text-gray-500">· {r.reviewer_country}</span>}
                </div>
                <span className="text-xs text-gray-400">{date(r.created_at)}{r.updated_at > r.created_at ? " · edited" : ""}</span>
              </div>
              {r.product_name && <p className="mt-0.5 text-xs text-gray-500">Asked about: {r.product_name}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{r.body}</p>
              {r.would_trade_again != null && <p className="mt-1 text-xs text-gray-500">{r.would_trade_again ? "Would trade again" : "Would not trade again"}</p>}
              {r.seller_response && (
                <div className="mt-3 rounded-lg border-l-2 border-green-500 bg-green-50/60 px-3 py-2 text-sm text-gray-700">
                  <p className="text-xs font-semibold text-green-800">Response from the supplier</p>
                  <p className="mt-0.5 whitespace-pre-line">{r.seller_response}</p>
                </div>
              )}
              {me && !isOwner && (
                <button onClick={() => setReporting(r.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600"><Flag className="h-3 w-3" /> Report</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {reporting && me && (
        <ReportModal reporterId={me.id} targetType="trade_review" targetId={reporting} targetLabel="this review" onClose={() => setReporting(null)} />
      )}
    </section>
  );
}
