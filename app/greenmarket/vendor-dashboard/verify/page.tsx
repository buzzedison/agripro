"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { vendorDocumentPath } from "@/lib/marketplace";
import { communityError } from "@/lib/feed-community";
type Vendor = {
  id: string;
  business_name: string;
  verification_status: string;
  id_document_url: string | null;
  business_document_url: string | null;
  id_document_type: string | null;
  business_document_type: string | null;
};
export default function VendorVerification() {
  const supabase = createClient(),
    router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null),
    [businessFile, setBusinessFile] = useState<File | null>(null),
    [idType, setIdType] = useState("national_id"),
    [businessType, setBusinessType] = useState("registration");
  const [links, setLinks] = useState<{ identity?: string; business?: string }>(
    {},
  );
  const load = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        router.replace(
          "/auth/login?redirectTo=/greenmarket/vendor-dashboard/verify",
        );
        return;
      }
      const { data, error } = await supabase
        .from("trade_vendors")
        .select(
          "id,business_name,verification_status,id_document_url,business_document_url,id_document_type,business_document_type",
        )
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      setVendor(data);
      setIdType(data.id_document_type || "national_id");
      setBusinessType(data.business_document_type || "registration");
      const next: { identity?: string; business?: string } = {};
      for (const [key, value] of [
        ["identity", data.id_document_url],
        ["business", data.business_document_url],
      ] as const) {
        const path = vendorDocumentPath(value, data.id);
        if (path) {
          const { data: link, error } = await supabase.storage
            .from("vendor-documents")
            .createSignedUrl(path, 300);
          if (error) throw error;
          if (link) next[key] = link.signedUrl;
        }
      }
      setLinks(next);
    } catch (e) {
      setError(communityError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);
  useEffect(() => {
    void load();
  }, [load]);
  function choose(file: File | undefined, kind: "id" | "business") {
    setError("");
    if (
      file &&
      (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        file.type,
      ) ||
        file.size > 5 * 1024 * 1024)
    ) {
      setError("Use a JPG, PNG, WebP or PDF file up to 5MB.");
      return;
    }
    if (kind === "id") setIdFile(file || null);
    else setBusinessFile(file || null);
  }
  async function upload(file: File, kind: string) {
    const extension = (
      {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
      } as Record<string, string>
    )[file.type];
    const path = `${vendor!.id}/${kind}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("vendor-documents")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return path;
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor || busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const identity = idFile
        ? await upload(idFile, "id")
        : vendorDocumentPath(vendor.id_document_url, vendor.id);
      const business = businessFile
        ? await upload(businessFile, "business")
        : vendorDocumentPath(vendor.business_document_url, vendor.id);
      if (!identity)
        throw new Error("Choose an identity document before submitting.");
      const { error } = await supabase
        .from("trade_vendors")
        .update({
          id_document_url: identity,
          business_document_url: business,
          id_document_type: idType,
          business_document_type: business ? businessType : null,
          verification_status: "pending_review",
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", vendor.id);
      if (error) throw error;
      setIdFile(null);
      setBusinessFile(null);
      setSuccess(
        "Documents submitted for review. Check this page for the decision.",
      );
      await load();
    } catch (e) {
      setError(communityError(e));
    } finally {
      setBusy(false);
    }
  }
  const approved = vendor?.verification_status === "approved";
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
      <Link
        href="/greenmarket/vendor-dashboard"
        className="text-sm font-semibold text-green-700"
      >
        ← Seller dashboard
      </Link>
      <header>
        <h1 className="text-2xl font-bold">Verify your identity</h1>
        <p className="mt-3 text-sm text-gray-600">
          Seller approval makes your listings public. Identity verification adds
          a badge after a moderator reviews your documents.
        </p>
      </header>
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
        <p>Loading verification details…</p>
      ) : (
        vendor && (
          <>
            <section className="rounded-xl border bg-white p-5">
              <p className="font-semibold">{vendor.business_name}</p>
              <p className="mt-2 text-sm text-gray-600">
                Status:{" "}
                {(
                  {
                    approved: "Identity verified",
                    pending_review: "Awaiting review",
                    rejected: "Please submit clearer documents",
                    not_submitted: "Not submitted",
                  } as Record<string, string>
                )[vendor.verification_status] || "Not submitted"}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Your files are private to you and authorized reviewers. Document
                links expire after five minutes.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-green-700">
                {links.identity && (
                  <a
                    href={links.identity}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View identity document
                  </a>
                )}
                {links.business && (
                  <a
                    href={links.business}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View business document
                  </a>
                )}
                <button
                  onClick={() => {
                    setError("");
                    void load();
                  }}
                  className="underline"
                >
                  Refresh status & links
                </button>
              </div>
            </section>
            {approved ? (
              <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
                Your identity review is complete. Contact support if you need to
                replace approved documents.
              </p>
            ) : (
              <form
                onSubmit={submit}
                className="space-y-5 rounded-xl border bg-white p-5"
              >
                <label className="block text-sm font-medium">
                  Identity document type
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="mt-2 w-full rounded-lg border bg-white p-3"
                  >
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver’s licence</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Identity document
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    disabled={busy}
                    onChange={(e) => choose(e.target.files?.[0], "id")}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Business document type
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="mt-2 w-full rounded-lg border bg-white p-3"
                  >
                    <option value="registration">Business registration</option>
                    <option value="licence">Business licence</option>
                    <option value="tax">Tax registration</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Business document (optional)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    disabled={busy}
                    onChange={(e) => choose(e.target.files?.[0], "business")}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP or PDF, up to 5MB per file. An identity badge
                  does not certify product quality or guarantee a transaction.
                </p>
                <button
                  disabled={busy || (!idFile && !vendor.id_document_url)}
                  className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Submitting…" : "Submit for review"}
                </button>
              </form>
            )}
          </>
        )
      )}
    </main>
  );
}
