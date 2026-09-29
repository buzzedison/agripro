"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FEED_TOPICS, communityError } from "@/lib/feed-community";

export default function FeedPreferences() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [crops, setCrops] = useState("");
  const [countries, setCountries] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [alerts, setAlerts] = useState({
    enquiries: true,
    replies: true,
    updates: true,
    answers: true,
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          router.replace("/auth/login?redirectTo=/feed/preferences");
          return;
        }
        const { data, error } = await supabase
          .from("feed_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        if (data) {
          setCrops(data.crops.join(", "));
          setCountries(data.countries.join(", "));
          setTopics(data.topics);
          setAlerts({
            enquiries: data.notify_enquiries,
            replies: data.notify_enquiry_replies,
            updates: data.notify_enquiry_updates,
            answers: data.notify_accepted_answers,
          });
        }
        setReady(true);
      } catch (error) {
        if (!cancelled) setError(communityError(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const split = (value: string) => [
      ...new Set(
        value
          .split(",")
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
    try {
      const { error } = await createClient().rpc("save_feed_preferences_v2", {
        p_crops: split(crops),
        p_topics: topics,
        p_countries: split(countries),
        p_enquiries: alerts.enquiries,
        p_replies: alerts.replies,
        p_updates: alerts.updates,
        p_answers: alerts.answers,
      });
      if (error) throw error;
      setSaved(true);
    } catch (error) {
      setError(communityError(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/feed" className="text-sm font-semibold text-green-700">
          ← Back to the feed
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Make the feed yours
        </h1>
        <p className="mt-3 text-gray-600">
          Choose what you grow, where you work, and what you want to learn. Your
          interests stay private.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}
        {saved && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-green-50 p-4 text-green-800"
          >
            Saved. Your For you feed will use these interests.{" "}
            <Link href="/feed" className="underline">
              Explore your feed
            </Link>
          </p>
        )}
        {loading ? (
          <p className="mt-8">Loading your preferences…</p>
        ) : (
          ready && (
            <form
              onSubmit={save}
              onChange={() => setSaved(false)}
              className="mt-8 space-y-6"
            >
              <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold">Your interests</h2>
                <label className="block text-sm font-medium">
                  Crops & commodities
                  <input
                    value={crops}
                    onChange={(e) => setCrops(e.target.value)}
                    placeholder="Maize, cassava, tomatoes"
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                    maxLength={1620}
                  />
                  <span className="mt-1 block font-normal text-gray-500">
                    Separate up to 20 names with commas. Matches the crop or
                    commodity named in questions and listings.
                  </span>
                </label>
                <label className="block text-sm font-medium">
                  Countries
                  <input
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="Ghana, Nigeria, Kenya"
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                    maxLength={810}
                  />
                  <span className="mt-1 block font-normal text-gray-500">
                    Use full country names, separated by commas. Choose up to
                    10.
                  </span>
                </label>
                <fieldset>
                  <legend className="text-sm font-medium">Topics</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {FEED_TOPICS.map((topic) => (
                      <label
                        key={topic.value}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={topics.includes(topic.value)}
                          onChange={(e) =>
                            setTopics(
                              e.target.checked
                                ? [...topics, topic.value]
                                : topics.filter((t) => t !== topic.value),
                            )
                          }
                        />
                        {topic.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="text-sm text-gray-500">
                  Matching posts from the last 14 days appear first in For you.
                  Your network feed stays chronological. Clear your interests to
                  return to the default order.
                </p>
              </section>
              <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold">Keep me in the loop</h2>
                <p className="text-sm text-gray-500">
                  These alerts appear in your notification bell.
                </p>
                {(
                  [
                    {
                      key: "enquiries",
                      label: "Someone enquires about my post",
                    },
                    {
                      key: "replies",
                      label: "Someone replies to my enquiry conversation",
                    },
                    {
                      key: "updates",
                      label: "The author updates my enquiry status",
                    },
                    { key: "answers", label: "My answer is marked helpful" },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={alerts[item.key]}
                      onChange={(e) =>
                        setAlerts({ ...alerts, [item.key]: e.target.checked })
                      }
                    />
                  </label>
                ))}
              </section>
              <button
                disabled={busy}
                className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save preferences"}
              </button>
            </form>
          )
        )}
      </div>
    </main>
  );
}
