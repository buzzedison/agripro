"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { communityError } from "@/lib/feed-community";
import { blockUser, unblockUser } from "@/lib/moderation";
import ReportModal from "@/components/ReportModal";

type Conversation = {
  id: string;
  post_id: string;
  target_url: string;
  title: string;
  other_user_id: string;
  other_name: string;
  can_reply: boolean;
  reply_notice: string | null;
  blocked_by_me: boolean;
};
type Message = {
  id: string;
  enquiry_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  removed_at: string | null;
};
export default function EnquiryConversation() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState("");
  const [thread, setThread] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [olderBusy, setOlderBusy] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const [readingOlder, setReadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const request = useRef(0);
  const sendKey = useRef<{ body: string; id: string } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const refresh = useCallback(
    async (scroll = false) => {
      const version = ++request.current;
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          router.replace(
            `/auth/login?redirectTo=${encodeURIComponent(`/feed/enquiries/${id}`)}`,
          );
          return;
        }
        const [info, history] = await Promise.all([
          supabase.rpc("enquiry_conversation_v2", { p_enquiry: id }),
          supabase.rpc("read_enquiry_messages", { p_enquiry: id }),
        ]);
        if (info.error) throw info.error;
        if (history.error) throw history.error;
        if (!info.data?.[0])
          throw new Error("This conversation is unavailable.");
        if (version !== request.current) return;
        const scrollbox = end.current?.parentElement;
        const followLatest =
          scroll ||
          (!!scrollbox &&
            scrollbox.scrollHeight -
              scrollbox.scrollTop -
              scrollbox.clientHeight <
              100);
        setUserId(user.id);
        setThread(info.data[0]);
        setMessages([...(history.data || [])].reverse());
        setHasOlder(history.data?.length === 50);
        setReadingOlder(false);
        setError("");
        // Keep any alerts for replies that arrived after the messages fetched here.
        const newest = history.data?.[0]?.created_at;
        if (newest && document.visibilityState === "visible") {
          await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("enquiry_id", id)
            .eq("type", "enquiry_reply")
            .lte("created_at", newest);
        }
        if (followLatest && version === request.current)
          window.setTimeout(
            () => end.current?.scrollIntoView({ block: "nearest" }),
            50,
          );
      } catch (error) {
        if (version === request.current) {
          setError(communityError(error));
          setThread((t) => (t ? { ...t, can_reply: false } : null));
        }
      } finally {
        if (version === request.current) setLoading(false);
      }
    },
    [id, router, supabase],
  );
  const invalidateRequests = useCallback(() => {
    request.current++;
  }, []);
  useEffect(() => {
    setThread(null);
    setMessages([]);
    setDraft("");
    setStatus("");
    sendKey.current = null;
    setLoading(true);
    void refresh(true);
    return invalidateRequests;
  }, [refresh, invalidateRequests]);
  useEffect(() => {
    if (readingOlder || busy || olderBusy || report) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refresh, readingOlder, busy, olderBusy, report]);
  async function older() {
    const first = messages[0];
    if (!first) return;
    request.current++; // Ignore any poll that began before loading history.
    setOlderBusy(true);
    setReadingOlder(true);
    try {
      const { data, error } = await supabase.rpc("read_enquiry_messages", {
        p_enquiry: id,
        p_before: first.created_at,
        p_before_id: first.id,
      });
      if (error) throw error;
      setMessages((current) => [...(data || [])].reverse().concat(current));
      setHasOlder(data?.length === 50);
    } catch (error) {
      setError(communityError(error));
    } finally {
      setOlderBusy(false);
    }
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !draft.trim() || !thread?.can_reply) return;
    setBusy(true);
    setError("");
    setStatus("");
    const body = draft.trim();
    if (!sendKey.current || sendKey.current.body !== body)
      sendKey.current = { body, id: crypto.randomUUID() };
    try {
      const { error } = await supabase.rpc("send_enquiry_reply", {
        p_enquiry: id,
        p_body: body,
        p_client_id: sendKey.current.id,
      });
      if (error) throw error;
      setDraft("");
      sendKey.current = null;
      setStatus("Reply sent.");
      await refresh(true);
    } catch (error) {
      setError(communityError(error));
    } finally {
      setBusy(false);
    }
  }
  async function toggleBlock() {
    if (!thread) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      if (thread.blocked_by_me) await unblockUser(userId, thread.other_user_id);
      else await blockUser(userId, thread.other_user_id);
      setStatus(
        thread.blocked_by_me
          ? "Member unblocked."
          : "Member blocked. No further replies can be sent between you.",
      );
      await refresh();
    } catch (error) {
      setError(communityError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link
          href="/feed/enquiries"
          className="text-sm font-semibold text-green-700"
        >
          ← My enquiries
        </Link>
        {loading ? (
          <p role="status" className="py-12 text-center">
            Loading conversation…
          </p>
        ) : (
          thread && (
            <>
              <header className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  Private enquiry
                </p>
                <h1 className="mt-2 break-words text-2xl font-bold text-gray-900">
                  {thread.title}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Conversation with {thread.other_name}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Only you and the other member can read this conversation.
                  Reporting shares the selected message with moderators.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                  <Link href={thread.target_url} className="text-green-700">
                    View listing
                  </Link>
                  <button
                    onClick={() => refresh(true)}
                    disabled={busy || olderBusy}
                    className="text-green-700"
                  >
                    Refresh replies
                  </button>
                  <button
                    onClick={toggleBlock}
                    disabled={busy}
                    className="sm:ml-auto text-red-700"
                  >
                    {thread.blocked_by_me ? "Unblock member" : "Block member"}
                  </button>
                </div>
              </header>
              <section
                aria-label="Conversation messages"
                tabIndex={0}
                className="max-h-[60vh] overflow-y-auto space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6"
              >
                {hasOlder && (
                  <button
                    onClick={older}
                    disabled={olderBusy || busy}
                    className="mx-auto block text-sm font-semibold text-green-700"
                  >
                    {olderBusy ? "Loading…" : "Load earlier messages"}
                  </button>
                )}
                {readingOlder && (
                  <p className="text-center text-xs text-gray-500">
                    Reading history. Refresh replies to return to the latest
                    messages.
                  </p>
                )}
                {messages.map((message) => {
                  const mine = message.sender_id === userId;
                  return (
                    <article
                      key={message.id}
                      className={`max-w-[90%] rounded-2xl p-4 ${mine ? "ml-auto bg-green-50" : "mr-auto bg-gray-100"}`}
                    >
                      <p className="text-xs font-semibold text-gray-600">
                        {mine ? "You" : thread.other_name}
                      </p>
                      <p
                        className={`mt-2 whitespace-pre-wrap break-words text-sm ${message.removed_at ? "italic text-gray-500" : "text-gray-900"}`}
                      >
                        {message.body}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <time dateTime={message.created_at}>
                          {new Date(message.created_at).toLocaleString()}
                        </time>
                        {!mine && !message.removed_at && (
                          <button
                            onClick={() => setReport(message.id)}
                            className="ml-auto text-red-700"
                          >
                            Report message
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
                {!messages.length && (
                  <p className="text-sm text-gray-500">No messages to show.</p>
                )}
                <div ref={end} />
              </section>
            </>
          )
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}{" "}
            <button onClick={() => refresh()} className="ml-2 underline">
              Retry
            </button>
          </p>
        )}
        {status && (
          <p role="status" className="text-sm text-green-800">
            {status}
          </p>
        )}
        {thread && (
          <form
            onSubmit={send}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            {thread.reply_notice && (
              <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                {thread.reply_notice}
              </p>
            )}
            <label
              htmlFor="enquiry-reply"
              className="text-sm font-semibold text-gray-900"
            >
              Your reply
            </label>
            <textarea
              id="enquiry-reply"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={busy || !thread.can_reply}
              maxLength={2000}
              rows={4}
              placeholder="Discuss availability, delivery, or your next step…"
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm disabled:bg-gray-50"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                {draft.length}/2,000 · Replies refresh every 15 seconds
              </span>
              <button
                disabled={busy || !thread.can_reply || !draft.trim()}
                className="shrink-0 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Please wait…" : "Send reply"}
              </button>
            </div>
          </form>
        )}
        {report && (
          <ReportModal
            reporterId={userId}
            targetType="enquiry_message"
            targetId={report}
            targetLabel="this private message"
            onClose={() => setReport(null)}
          />
        )}
      </div>
    </main>
  );
}
