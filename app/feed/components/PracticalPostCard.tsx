"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ArrowUpRight, Send, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { communityError } from "@/lib/feed-community";
import { PracticalPost, safeApplicationUrl } from "@/lib/practical-feed";

export default function PracticalPostCard({
  post,
  userId,
  preview = false,
}: {
  post: PracticalPost;
  userId?: string;
  preview?: boolean;
}) {
  const kind = post.post_kind || "update";
  const d = post.post_details || {};
  const [sent, setSent] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const closed =
    post.is_closed ||
    !!(post.expires_at && new Date(post.expires_at) <= new Date());
  const available = post.moderation_status === "published" && !closed;
  useEffect(() => {
    if (preview || kind === "update") return;
    let cancelled = false;
    const supabase = createClient();
    if (kind === "question")
      supabase
        .from("feed_accepted_answers")
        .select("comment_id")
        .eq("post_id", post.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) setAnswered(!!data);
        });
    else if (userId && userId !== post.user_id)
      supabase
        .from("feed_enquiries")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) setSent(!!data);
        });
    return () => {
      cancelled = true;
    };
  }, [post.id, post.user_id, kind, userId, preview]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  if (kind === "update") return null;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().rpc("send_feed_enquiry", {
        p_post: post.id,
        p_message: message,
      });
      if (error) throw error;
      setSent(true);
      setOpen(false);
      setMessage("");
    } catch (error) {
      setError(communityError(error));
    } finally {
      setBusy(false);
    }
  }
  const label =
    kind === "question"
      ? "Community question"
      : kind === "listing"
        ? d.listing_type === "buy"
          ? "Wanted to buy"
          : "Available to buy"
        : d.opportunity_type;
  const applicationUrl = safeApplicationUrl(d.url);
  return (
    <section className="mb-4 overflow-hidden rounded-xl border border-green-100 bg-green-50/50">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-green-800">
          <span className="capitalize">{label}</span>
          {closed && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-600">
              Closed
            </span>
          )}
          {answered && (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-4 w-4" /> Answer accepted
            </span>
          )}
        </div>
        <h3 className="mt-2 break-words text-lg font-bold leading-snug text-gray-900">
          {d.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {d.location}
          {kind === "question" && d.crop ? ` · ${d.crop}` : ""}
        </p>
        {kind === "listing" && (
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-gray-500">Quantity</dt>
              <dd className="break-words font-semibold">
                {d.quantity} {d.unit} · {d.commodity}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Price per {d.unit}</dt>
              <dd className="break-words font-semibold">
                {d.price
                  ? `${d.currency} ${Number(d.price).toLocaleString()}`
                  : "Negotiable"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Available from</dt>
              <dd>{d.available_from}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Closes (UTC)</dt>
              <dd>{d.deadline}</dd>
            </div>
          </dl>
        )}
        {kind === "opportunity" && (
          <div className="mt-3 space-y-2 text-sm">
            <p className="font-semibold">Apply by {d.deadline} · 23:59 UTC</p>
            <p className="whitespace-pre-wrap break-words text-gray-600">
              <span className="font-medium text-gray-800">Who can apply: </span>
              {d.eligibility}
            </p>
            {applicationUrl && (
              <p className="break-all text-xs text-gray-500">
                Source: {new URL(applicationUrl).hostname}
              </p>
            )}
          </div>
        )}
      </div>
      {!preview && (
        <div className="flex flex-wrap gap-3 border-t border-green-100 bg-white/60 px-4 py-3">
          {kind === "question" ? (
            <Link
              href={`/feed/post/${post.id}#comments`}
              className="text-sm font-semibold text-green-700"
            >
              {answered
                ? "View answers"
                : userId === post.user_id
                  ? "View & accept an answer"
                  : "Answer this question"}{" "}
              →
            </Link>
          ) : (
            <>
              {kind === "opportunity" && available && applicationUrl && (
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-green-700"
                >
                  View application <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {userId === post.user_id ? (
                <Link
                  href="/feed/enquiries"
                  className="text-sm font-semibold text-green-700"
                >
                  Manage post & enquiries →
                </Link>
              ) : sent ? (
                <Link
                  href="/feed/enquiries"
                  className="text-sm font-semibold text-green-700"
                >
                  Enquiry sent · Track response →
                </Link>
              ) : !userId ? (
                <Link
                  href={`/auth/login?redirectTo=/feed/post/${post.id}`}
                  className="text-sm font-semibold text-green-700"
                >
                  Sign in to enquire
                </Link>
              ) : (
                <button
                  disabled={!available}
                  onClick={() => {
                    setError("");
                    setOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 disabled:text-gray-400"
                >
                  <Send className="h-3.5 w-3.5" />
                  {closed
                    ? "No longer accepting enquiries"
                    : post.moderation_status !== "published"
                      ? "Awaiting publication"
                      : kind === "opportunity"
                        ? "Request details"
                        : d.listing_type === "buy"
                          ? "Offer supply"
                          : "I’m interested"}
                </button>
              )}
            </>
          )}
        </div>
      )}
      {open && (
        <dialog
          ref={dialog}
          onCancel={(e) => {
            if (busy) e.preventDefault();
            else setOpen(false);
          }}
          aria-labelledby={`enquiry-${post.id}`}
          className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 text-left shadow-2xl backdrop:bg-black/50"
        >
          <form onSubmit={submit} className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 id={`enquiry-${post.id}`} className="font-bold">
                Enquire about {d.title}
              </h2>
              <button
                type="button"
                disabled={busy}
                aria-label="Close enquiry"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Only you and the post author can see this enquiry. Include your
              requirements and preferred way to follow up.
            </p>
            <label className="block text-sm font-medium">
              Your message
              <textarea
                autoFocus
                required
                minLength={20}
                maxLength={1000}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2 w-full rounded-xl border p-3 font-normal"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={busy || message.trim().length < 20}
              className="w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send private enquiry"}
            </button>
          </form>
        </dialog>
      )}
    </section>
  );
}
