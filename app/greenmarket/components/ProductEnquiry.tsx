"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { communityError } from "@/lib/feed-community";
import ReportModal from "@/components/ReportModal";
export default function ProductEnquiry({
  productId,
  slug,
  minQuantity,
  unit,
  available,
  owner,
  hasSeller,
}: {
  productId: string;
  slug: string;
  minQuantity: number;
  unit: string;
  available: boolean;
  owner: boolean;
  hasSeller: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reporter, setReporter] = useState("");
  async function currentUser() {
    const {
      data: { user },
      error,
    } = await createClient().auth.getUser();
    if (error) throw error;
    if (!user)
      router.push(
        `/auth/login?redirectTo=${encodeURIComponent(`/greenmarket/products/${slug}#request-quote`)}`,
      );
    return user;
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      if (!(await currentUser())) return;
      const { data, error } = await createClient().rpc(
        "request_product_quote",
        {
          p_product: productId,
          p_quantity: Number(form.get("quantity")),
          p_destination: String(form.get("destination")),
          p_message: String(form.get("message")),
        },
      );
      if (error) throw error;
      router.push(`/feed/enquiries/${data}`);
    } catch (error) {
      setError(communityError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      id="request-quote"
      className="mt-6 scroll-mt-24 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <h2 className="font-bold text-gray-900">
        {owner ? "Manage enquiries" : "Request a quote"}
      </h2>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {owner ? (
        <Link
          href="/feed/enquiries"
          className="mt-3 inline-block text-sm font-semibold text-green-700 underline"
        >
          Open your enquiries
        </Link>
      ) : !hasSeller ? (
        <p className="mt-2 text-sm text-gray-600">
          This supplier has not linked a member account yet. Use their contact
          details below.
        </p>
      ) : !available ? (
        <p className="mt-2 text-sm text-gray-600">
          This product is currently out of stock. Existing conversations remain
          in My enquiries.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Discuss quantity, delivery and price privately with the seller. This
            sends an enquiry; it does not place an order or take payment.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Quantity ({unit})
              <input
                required
                name="quantity"
                type="number"
                step="any"
                min={Math.max(1, minQuantity)}
                max={1000000000}
                defaultValue={Math.max(1, minQuantity)}
                className="mt-1 w-full rounded-lg border bg-white p-2.5"
              />
            </label>
            <label className="text-sm font-medium">
              Delivery town / country
              <input
                required
                name="destination"
                minLength={2}
                maxLength={120}
                placeholder="Accra, Ghana"
                className="mt-1 w-full rounded-lg border bg-white p-2.5"
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            What do you need?
            <textarea
              required
              name="message"
              minLength={20}
              maxLength={700}
              rows={3}
              placeholder="Include your preferred delivery date and any questions about the product."
              className="mt-1 w-full rounded-lg border bg-white p-2.5"
            />
          </label>
          <button
            disabled={busy}
            className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Opening enquiry…" : "Send quote request"}
          </button>
          <p className="text-xs text-gray-500">
            If you already enquired, we’ll open your existing conversation.
          </p>
        </form>
      )}
      {!owner && (
        <button
          className="mt-5 text-xs font-semibold text-red-700 underline"
          onClick={async () => {
            setError("");
            try {
              const user = await currentUser();
              if (user) setReporter(user.id);
            } catch (e) {
              setError(communityError(e));
            }
          }}
        >
          Report this listing
        </button>
      )}
      {reporter && (
        <ReportModal
          reporterId={reporter}
          targetType="product"
          targetId={productId}
          targetLabel="this product listing"
          onClose={() => setReporter("")}
        />
      )}
    </section>
  );
}
