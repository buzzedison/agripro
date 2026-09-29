"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { communityError } from "@/lib/feed-community";
import { PracticalPost } from "@/lib/practical-feed";

type Answer = {
  id: string;
  content: string;
  parent_comment_id?: string | null;
  profile?: { full_name?: string } | null;
};
export default function QuestionAnswerSummary({
  post,
  userId,
  comments,
  onChange,
}: {
  post: PracticalPost;
  userId?: string;
  comments: Answer[];
  onChange: () => void;
}) {
  const [accepted, setAccepted] = useState("");
  const [choice, setChoice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (post.post_kind !== "question") return;
    let cancelled = false;
    createClient()
      .from("feed_accepted_answers")
      .select("comment_id")
      .eq("post_id", post.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) {
          setAccepted(data?.comment_id || "");
          setChoice(data?.comment_id || "");
          if (error) setError(communityError(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [post.id, post.post_kind]);
  if (post.post_kind !== "question") return null;
  const answer = comments.find((c) => c.id === accepted);
  const owner =
    userId === post.user_id && post.moderation_status === "published";
  async function save() {
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().rpc("accept_feed_answer", {
        p_post: post.id,
        p_comment: choice || null,
      });
      if (error) throw error;
      setAccepted(choice);
      onChange();
    } catch (error) {
      setError(communityError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
      <h2 className="font-semibold text-green-900">
        {answer ? "Accepted answer" : "Help resolve this question"}
      </h2>
      {answer ? (
        <>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
            {answer.content}
          </p>
          <a
            href={`#comment-${answer.id}`}
            className="mt-2 inline-block text-xs font-semibold text-green-700"
          >
            Answer by {answer.profile?.full_name || "a community member"} · View
            discussion →
          </a>
        </>
      ) : (
        <p className="mt-1 text-sm text-gray-600">
          The person who asked can mark the answer that helped. An accepted
          answer is a community endorsement, not professional verification.
        </p>
      )}
      {owner && (
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="min-w-0 flex-1 text-xs font-medium text-gray-600">
            Choose the most helpful answer
            <select
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
              disabled={busy}
              className="mt-1 w-full rounded-lg border bg-white p-2 text-sm"
            >
              <option value="">No accepted answer</option>
              {comments
                .filter((c) => !c.parent_comment_id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.profile?.full_name || "Member"}:{" "}
                    {c.content.slice(0, 100)}
                  </option>
                ))}
            </select>
          </label>
          <button
            disabled={busy || choice === accepted}
            onClick={save}
            className="self-end rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save choice"}
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
