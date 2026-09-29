import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productPrice } from "@/lib/marketplace";
async function setVisibility(form: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: vendor } = await supabase
    .from("trade_vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!vendor) throw new Error("Seller access required.");
  const { error } = await supabase
    .from("trade_products")
    .update({ is_active: form.get("active") === "true" })
    .eq("id", String(form.get("id")))
    .eq("vendor_id", vendor.id);
  if (error)
    redirect("/greenmarket/vendor-dashboard/products?error=visibility");
  revalidatePath("/greenmarket/vendor-dashboard/products");
}
export default async function SellerProducts({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient(),
    {
      data: { user },
    } = await supabase.auth.getUser();
  if (!user)
    redirect("/auth/login?redirectTo=/greenmarket/vendor-dashboard/products");
  const { data: vendor } = await supabase
    .from("trade_vendors")
    .select("id,status")
    .eq("user_id", user.id)
    .single();
  if (!vendor) redirect("/greenmarket/become-vendor");
  const { data: products, error } = await supabase
    .from("trade_products")
    .select("id,name,slug,price,currency,unit,is_active,stock_status")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const query = await searchParams;
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your products</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your latest 100 listings and keep availability current.
          </p>
        </div>
        <Link
          href="/greenmarket/products/new"
          className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white"
        >
          Add a product
        </Link>
      </div>
      <Link
        href="/feed/enquiries"
        className="inline-block text-sm font-semibold text-green-700"
      >
        View buyer enquiries →
      </Link>
      {vendor.status !== "approved" && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Your products become public when your seller account is approved.
        </p>
      )}
      {(error || query.error) && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          Could not update or load listings. Check your account status and try
          again.
        </p>
      )}
      <div className="space-y-4">
        {products?.map((p) => (
          <article
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5"
          >
            <div>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {productPrice(p.price, p.currency, p.unit)} ·{" "}
                {p.is_active ? "Listed" : "Hidden"} ·{" "}
                {p.stock_status.replaceAll("_", " ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              <Link
                href={`/greenmarket/products/${p.slug}/edit`}
                className="text-green-700"
              >
                Edit
              </Link>
              <Link
                href={`/greenmarket/products/${p.slug}`}
                className="text-green-700"
              >
                View
              </Link>
              <form action={setVisibility}>
                <input type="hidden" name="id" value={p.id} />
                <input
                  type="hidden"
                  name="active"
                  value={String(!p.is_active)}
                />
                <button
                  disabled={["suspended", "rejected"].includes(vendor.status)}
                  className="text-gray-600 underline disabled:opacity-40"
                >
                  {p.is_active ? "Hide listing" : "Show listing"}
                </button>
              </form>
            </div>
          </article>
        ))}
        {!error && !products?.length && (
          <p className="rounded-xl border border-dashed p-8 text-center text-gray-500">
            Add your first product to start receiving enquiries.
          </p>
        )}
      </div>
    </main>
  );
}
