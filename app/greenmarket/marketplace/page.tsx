"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, Search, Store, ShieldCheck, MapPin } from "lucide-react";
import VendorCard from "../components/VendorCard";
import { productPrice, SUPPLIER_TYPES } from "@/lib/marketplace";

type Vendor = {
  id: string;
  business_name: string;
  business_type: string;
  product_description: string;
  logo_url: string | null;
  cover_image_url: string | null;
  country: string;
  city: string;
  is_featured: boolean;
  is_verified: boolean;
  slug: string;
};
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  currency: string;
  unit: string;
  min_order_quantity: number;
  images: string[];
  stock_status: string;
  updated_at: string;
  vendor: Vendor;
  category: { name: string } | null;
};
type Category = { id: string; name: string; slug: string };
export default function MarketplacePage() {
  return (
    <Suspense
      fallback={<p className="p-12 text-center">Loading marketplace…</p>}
    >
      <Marketplace />
    </Suspense>
  );
}
function Marketplace() {
  const router = useRouter(),
    params = useSearchParams(),
    key = params.toString();
  const tab = params.get("tab") === "suppliers" ? "suppliers" : "products";
  const [products, setProducts] = useState<Product[]>([]),
    [vendors, setVendors] = useState<Vendor[]>([]),
    [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [paging, setPaging] = useState({ page: 1, total: 0, totalPages: 0 }),
    [view, setView] = useState("grid");
  function change(values: Record<string, string>) {
    const next = new URLSearchParams(key);
    next.delete("page");
    Object.entries(values).forEach(([k, v]) =>
      v ? next.set(k, v) : next.delete(k),
    );
    router.replace(`/greenmarket/marketplace?${next}`, { scroll: false });
  }
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/trade/categories", { signal: abort.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load categories.");
        return r.json();
      })
      .then((data) => setCategories(data.categories || []))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => abort.abort();
  }, [retry]);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    const query = new URLSearchParams(key);
    query.set("limit", "12");
    query.delete("tab");
    fetch(
      `/api/trade/${tab === "products" ? "products" : "vendors"}?${query}`,
      { signal: abort.signal },
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Could not load the marketplace.");
        return data;
      })
      .then((data) => {
        if (abort.signal.aborted) return;
        setProducts(data.products || []);
        setVendors(data.vendors || []);
        setPaging(data.pagination);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setProducts([]);
          setVendors([]);
        }
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [key, tab, retry]);
  function filter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    change(
      Object.fromEntries(
        [
          "search",
          "country",
          "category",
          "currency",
          "min",
          "max",
          "stock",
          "verified",
        ].map((k) => [k, String(form.get(k) || "")]),
      ),
    );
  }
  return (
    <main className="min-h-screen bg-stone-50 pb-16">
      <header className="bg-emerald-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <Link href="/greenmarket" className="text-sm text-emerald-200">
            ← Green Market
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
                Grow your next business connection
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Find products. Meet suppliers.
              </h1>
              <p className="mt-3 max-w-xl text-emerald-100">
                Browse agricultural goods, compare offers, and discuss a quote
                directly with the seller.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/feed/enquiries"
                className="rounded-xl border border-emerald-700 px-4 py-3 text-sm font-semibold"
              >
                My enquiries
              </Link>
              <Link
                href="/greenmarket/become-vendor"
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-950"
              >
                Become a seller
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-7">
        <div className="flex gap-2" aria-label="Marketplace sections">
          {(["products", "suppliers"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={tab === value}
              onClick={() =>
                change({
                  tab: value,
                  category: "",
                  vendor: "",
                  currency: "",
                  min: "",
                  max: "",
                  stock: "",
                })
              }
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${tab === value ? "bg-emerald-700 text-white" : "border bg-white text-gray-700"}`}
            >
              {value === "products" ? (
                <Package size={17} />
              ) : (
                <Store size={17} />
              )}{" "}
              {value === "products" ? "Products" : "Suppliers"}
            </button>
          ))}
        </div>
        <form
          key={key}
          onSubmit={filter}
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium">
              Search
              <input
                name="search"
                defaultValue={params.get("search") || ""}
                maxLength={100}
                placeholder={
                  tab === "products"
                    ? "Maize, tomatoes, equipment…"
                    : "Supplier name or what they sell…"
                }
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>
            <label className="text-sm font-medium">
              Country
              <input
                name="country"
                defaultValue={params.get("country") || ""}
                maxLength={80}
                placeholder="Any country"
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>
            <label className="text-sm font-medium">
              Category
              <select
                name="category"
                defaultValue={params.get("category") || ""}
                className="mt-2 w-full rounded-lg border bg-white p-3"
              >
                <option value="">All categories</option>
                {tab === "products"
                  ? categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))
                  : SUPPLIER_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
              </select>
            </label>
          </div>
          {tab === "products" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="text-xs font-medium text-gray-600">
                Currency
                <select
                  name="currency"
                  defaultValue={params.get("currency") || ""}
                  className="mt-2 w-full rounded-lg border bg-white p-2.5"
                >
                  <option value="">Any currency</option>
                  {["GHS", "USD", "KES", "NGN", "ZAR", "EUR"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-gray-600">
                Minimum price
                <input
                  name="min"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={params.get("min") || ""}
                  placeholder="Any"
                  className="mt-2 w-full rounded-lg border p-2.5"
                />
              </label>
              <label className="text-xs font-medium text-gray-600">
                Maximum price
                <input
                  name="max"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={params.get("max") || ""}
                  placeholder="Any"
                  className="mt-2 w-full rounded-lg border p-2.5"
                />
              </label>
              <label className="text-xs font-medium text-gray-600">
                Availability
                <select
                  name="stock"
                  defaultValue={params.get("stock") || ""}
                  className="mt-2 w-full rounded-lg border bg-white p-2.5"
                >
                  <option value="">All stock statuses</option>
                  <option value="available">In stock or low stock</option>
                </select>
              </label>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="verified"
                value="true"
                defaultChecked={params.get("verified") === "true"}
              />
              Verified suppliers only
            </label>
            <p className="text-xs text-gray-500">
              {tab === "products"
                ? "Choose a currency when filtering by price."
                : ""}
            </p>
            <button
              type="button"
              onClick={() =>
                router.replace(`/greenmarket/marketplace?tab=${tab}`, {
                  scroll: false,
                })
              }
              className="text-sm text-gray-600 underline sm:ml-auto"
            >
              Clear filters
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between gap-3">
          <p role="status" className="text-sm text-gray-600">
            {loading
              ? "Finding matches…"
              : error
                ? "Results unavailable"
                : `${paging.total} ${tab === "products" ? "products" : "suppliers"} found`}
            {params.get("vendor") && " · Selected supplier"}
          </p>
          <label className="text-sm">
            View{" "}
            <select
              aria-label="Results layout"
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="ml-2 rounded-lg border bg-white p-2"
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </label>
        </div>
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
          >
            {error}
            <button
              onClick={() => setRetry((n) => n + 1)}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-hidden="true"
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : !(products.length || vendors.length) ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <h2 className="text-xl font-semibold">No matches yet</h2>
            <p className="mt-2 text-sm text-gray-600">
              Try another category or country, or clear your filters.
            </p>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                : "mx-auto grid max-w-3xl gap-5"
            }
          >
            {tab === "suppliers"
              ? vendors.map((v) => (
                  <VendorCard
                    key={v.id}
                    vendor={v}
                    actions={[
                      {
                        label: "View supplier",
                        href: `/greenmarket/vendors/${v.slug}`,
                      },
                      {
                        label: "Browse products",
                        href: `/greenmarket/marketplace?tab=products&vendor=${encodeURIComponent(v.slug)}`,
                        variant: "ghost",
                      },
                    ]}
                  />
                ))
              : products.map((product) => (
                  <article
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
                  >
                    <Link
                      href={`/greenmarket/products/${product.slug}`}
                      className="relative block h-48 bg-emerald-50"
                    >
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width:640px) 100vw, 380px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="absolute inset-0 m-auto h-14 w-14 text-emerald-200" />
                      )}
                      <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-semibold">
                        {product.stock_status === "out_of_stock"
                          ? "Out of stock"
                          : product.stock_status === "low_stock"
                            ? "Low stock"
                            : "In stock"}
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs text-gray-500">
                        {product.category?.name || "Uncategorised"}
                      </p>
                      <Link
                        href={`/greenmarket/products/${product.slug}`}
                        className="mt-1 text-lg font-bold text-gray-900 hover:text-emerald-700"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-2 font-semibold text-emerald-800">
                        {productPrice(
                          product.price,
                          product.currency,
                          product.unit,
                        )}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Minimum order: {product.min_order_quantity || 1}{" "}
                        {product.unit}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Link
                          href={`/greenmarket/vendors/${product.vendor.slug}`}
                          className="truncate hover:underline"
                        >
                          {product.vendor.business_name}
                        </Link>
                        {product.vendor.is_verified && (
                          <ShieldCheck
                            size={16}
                            className="shrink-0 text-emerald-700"
                            aria-label="Verified supplier"
                          />
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} />
                        {[product.vendor.city, product.vendor.country]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"}
                      </p>
                      <p className="mb-4 mt-2 text-xs text-gray-400">
                        Updated{" "}
                        {new Date(product.updated_at).toLocaleDateString()}
                      </p>
                      <Link
                        href={`/greenmarket/products/${product.slug}#request-quote`}
                        className="mt-auto rounded-xl bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
                      >
                        {product.stock_status === "out_of_stock"
                          ? "View product"
                          : "Request quote"}
                      </Link>
                    </div>
                  </article>
                ))}
          </div>
        )}
        {!loading && !error && paging.totalPages > 1 && (
          <nav
            aria-label="Results pages"
            className="flex items-center justify-center gap-5"
          >
            <button
              disabled={paging.page <= 1}
              onClick={() => {
                const next = new URLSearchParams(key);
                next.set("page", String(paging.page - 1));
                router.replace(`/greenmarket/marketplace?${next}`, {
                  scroll: false,
                });
              }}
              className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {paging.page} of {paging.totalPages}
            </span>
            <button
              disabled={paging.page >= paging.totalPages}
              onClick={() => {
                const next = new URLSearchParams(key);
                next.set("page", String(paging.page + 1));
                router.replace(`/greenmarket/marketplace?${next}`, {
                  scroll: false,
                });
              }}
              className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
