export const SUPPLIER_TYPES = [
  ["fresh-produce", "Fresh produce"],
  ["livestock", "Livestock"],
  ["grains", "Grains & cereals"],
  ["processed-foods", "Processed foods"],
  ["dairy", "Dairy"],
  ["aquaculture", "Aquaculture"],
  ["eco-products", "Eco products"],
  ["farm-equipment", "Farm equipment"],
  ["seeds", "Seeds & inputs"],
  ["agro-services", "Agro services"],
  ["organic-farm", "Organic farms"],
  ["food-beverage", "Food & beverage"],
  ["other", "Other"],
] as const;
export function pageOptions(params: URLSearchParams, defaultLimit = 12) {
  const integer = (value: string | null, fallback: number, max: number) =>
    value && /^\d+$/.test(value)
      ? Math.max(1, Math.min(max, Number(value)))
      : fallback;
  const page = integer(params.get("page"), 1, 10000),
    limit = integer(params.get("limit"), defaultLimit, 50);
  return { page, limit, offset: (page - 1) * limit };
}
// Quoted PostgREST filter values: punctuation stays literal, SQL wildcards are escaped.
export function searchPattern(value: string) {
  const literal = value
    .trim()
    .slice(0, 100)
    .replace(/\\/g, "\\\\")
    .replace(/[%_]/g, "\\$&");
  return `"%${literal.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}%"`;
}
export function literalPattern(value: string) {
  return `%${value
    .trim()
    .slice(0, 100)
    .replace(/[\\%_]/g, "\\$&")}%`;
}
export function productPrice(
  price: number | null,
  currency = "GHS",
  unit?: string,
) {
  if (price === null || !Number.isFinite(Number(price)))
    return "Request a price";
  const formatted = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(Number(price));
  return `${currency} ${formatted}${unit ? ` / ${unit}` : ""}`;
}
export function vendorDocumentPath(
  value: string | null | undefined,
  vendorId: string,
) {
  if (!value) return null;
  let path = value;
  if (/^https?:/.test(value)) {
    try {
      const url = new URL(value);
      const marker = "/vendor-documents/";
      const index = url.pathname.indexOf(marker);
      if (index < 0) return null;
      path = decodeURIComponent(url.pathname.slice(index + marker.length));
    } catch {
      return null;
    }
  }
  return path.startsWith(`${vendorId}/`) && !path.split("/").includes("..")
    ? path
    : null;
}
