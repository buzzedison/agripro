"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { communityError } from "@/lib/feed-community";
import { PracticalPost } from "@/lib/practical-feed";

type OwnPost = PracticalPost & { created_at: string };
type Enquiry = {
  id: string;
  post_id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
  posts: PracticalPost | null;
  owner_id: string;
  title: string;
  target_url: string;
};
export default function FeedEnquiries() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [posts, setPosts] = useState<OwnPost[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"received" | "sent" | "posts">("received");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "sent" || tab === "received") setTab(tab);
  }, []);
  useEffect(() => {
    if (!loading && window.location.hash)
      document
        .getElementById(window.location.hash.slice(1))
        ?.scrollIntoView({ block: "center" });
  }, [loading, tab]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login?redirectTo=/feed/enquiries");
        return;
      }
      setUserId(user.id);
      const results = await Promise.all([
        supabase.rpc("my_enquiry_conversations"),
        supabase
          .from("posts")
          .select(
            "id,user_id,post_kind,post_details,moderation_status,is_closed,expires_at,created_at",
          )
          .eq("user_id", user.id)
          .in("post_kind", ["listing", "opportunity"])
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      for (const result of results) if (result.error) throw result.error;
      const rows = (results[0].data || []) as unknown as Enquiry[];
      const target = window.location.hash.replace("#enquiry-", "");
      if (
        /^[0-9a-f-]{36}$/i.test(target) &&
        !rows.some((row) => row.id === target)
      ) {
        const { data: found, error } = await supabase.rpc(
          "my_enquiry_conversations",
          { p_id: target },
        );
        const data = found?.[0];
        if (error) throw error;
        if (data) rows.unshift(data as unknown as Enquiry);
      }
      setEnquiries(rows);
      setPosts((results[1].data || []) as OwnPost[]);
      const ids = [
        ...new Set(rows.flatMap((row) => [row.user_id, row.owner_id])),
      ];
      if (ids.length) {
        const { data } = await supabase
          .from("profiles")
          .select("id,full_name")
          .in("id", ids);
        setNames(
          Object.fromEntries(
            (data || []).map((p) => [p.id, p.full_name || "Member"]),
          ),
        );
      }
    } catch (error) {
      setError(communityError(error));
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);
  useEffect(() => {
    load();
  }, [load]);
  async function act(
    operation: () => PromiseLike<{ error: unknown }>,
    message: string,
  ) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const { error } = await operation();
      if (error) throw error;
      await load();
      setSuccess(message);
    } catch (error) {
      setError(communityError(error));
    } finally {
      setBusy(false);
    }
  }
  const received = enquiries.filter((e) => e.owner_id === userId);
  const sent = enquiries.filter((e) => e.user_id === userId);
  const visible = tab === "received" ? received : sent;
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/feed" className="text-sm font-semibold text-green-700">
          ← Back to feed
        </Link>
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
            Turn conversations into opportunities
          </p>
          <h1 className="mt-2 text-3xl font-bold">My enquiries & listings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Follow up with interested members and keep your listings current.
            Showing the latest 100 enquiries and posts.
          </p>
        </header>
        <div className="grid grid-cols-3 gap-3">
          {[
            [received.length, "Received"],
            [
              received.filter((e) => e.status === "new").length,
              "Need follow-up",
            ],
            [sent.length, "Sent"],
          ].map(([count, label]) => (
            <div key={label} className="rounded-xl border bg-white p-4">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["received", "sent", "posts"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-green-700 text-white" : "border bg-white text-gray-600"}`}
            >
              {value === "posts"
                ? "My listings & opportunities"
                : value === "received"
                  ? "Received"
                  : "Sent"}
            </button>
          ))}
          <button
            onClick={load}
            disabled={loading || busy}
            className="ml-auto text-sm text-green-700"
          >
            Refresh
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-4 text-sm text-green-800"
          >
            {success}
          </p>
        )}
        {loading ? (
          <p role="status" className="p-8 text-center text-sm text-gray-500">
            Loading enquiries…
          </p>
        ) : tab === "posts" ? (
          <div className="space-y-4">
            {posts.length ? (
              posts.map((post) => {
                const expired =
                  !!post.expires_at && new Date(post.expires_at) <= new Date();
                return (
                  <article
                    key={post.id}
                    className="rounded-2xl border bg-white p-5"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <Link
                        href={`/feed/post/${post.id}`}
                        className="font-bold text-gray-900 hover:underline"
                      >
                        {post.post_details?.title}
                      </Link>
                      <span className="text-xs font-semibold text-gray-500">
                        {post.moderation_status !== "published"
                          ? post.moderation_status
                          : expired
                            ? "Expired"
                            : post.is_closed
                              ? "Closed"
                              : "Open"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {post.post_kind === "listing" ? "Listing" : "Opportunity"}{" "}
                      · Closes {post.post_details?.deadline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/feed/post/${post.id}`}
                        className="text-sm font-semibold text-green-700"
                      >
                        View post
                      </Link>
                      {!expired && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            act(
                              () =>
                                supabase.rpc("close_feed_post", {
                                  p_post: post.id,
                                  p_closed: !post.is_closed,
                                }),
                              post.is_closed
                                ? "Post reopened."
                                : "Post closed to new enquiries.",
                            )
                          }
                          className="text-sm font-semibold text-green-700 underline"
                        >
                          {post.is_closed
                            ? "Reopen"
                            : "Mark closed / fulfilled"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <Empty text="Create a buy/sell listing or share an opportunity to see it here." />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visible.length ? (
              visible.map((enquiry) => (
                <article
                  key={enquiry.id}
                  id={`enquiry-${enquiry.id}`}
                  className="rounded-2xl border bg-white p-5"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <Link
                      href={enquiry.target_url}
                      className="font-bold hover:underline"
                    >
                      {enquiry.title || "Listing unavailable"}
                    </Link>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-600">
                      {enquiry.status === "new"
                        ? "Awaiting follow-up"
                        : enquiry.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {tab === "received" ? "From" : "To"}{" "}
                    {names[
                      tab === "received" ? enquiry.user_id : enquiry.owner_id
                    ] || "Member"}{" "}
                    · {new Date(enquiry.created_at).toLocaleString()}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-700">
                    {enquiry.message}
                  </p>
                  <Link
                    href={`/feed/enquiries/${enquiry.id}`}
                    className="mt-4 inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open conversation →
                  </Link>
                  {tab === "received" && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/connect/${enquiry.user_id}`}
                        className="text-sm font-semibold text-green-700"
                      >
                        View member & connect →
                      </Link>
                      <label className="ml-auto text-xs text-gray-500">
                        Follow-up status
                        <select
                          value={enquiry.status}
                          disabled={busy}
                          onChange={(e) =>
                            act(
                              () =>
                                supabase.rpc("update_feed_enquiry", {
                                  p_enquiry: enquiry.id,
                                  p_status: e.target.value,
                                }),
                              "Enquiry status updated.",
                            )
                          }
                          className="ml-2 rounded-lg border bg-white p-2 text-sm"
                        >
                          <option value="new">Needs follow-up</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </label>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <Empty
                text={
                  tab === "received"
                    ? "No enquiries yet. Share a specific offer with clear quantities, location and dates."
                    : "Your private enquiries will appear here after you express interest in a post."
                }
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">
      {text}
    </p>
  );
}
