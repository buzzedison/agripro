export type PostKind = "update" | "question" | "listing" | "opportunity";
export type PostDetails = Record<string, string>;
export type PracticalPost = {
  id: string;
  user_id: string;
  post_kind?: PostKind;
  post_details?: PostDetails;
  moderation_status?: string;
  is_closed?: boolean;
  expires_at?: string | null;
};
export const POST_KINDS: { value: PostKind; label: string; action: string }[] =
  [
    { value: "update", label: "Updates", action: "Share an update" },
    { value: "question", label: "Questions", action: "Ask a question" },
    { value: "listing", label: "Buy & sell", action: "Buy or sell" },
    {
      value: "opportunity",
      label: "Opportunities",
      action: "Share an opportunity",
    },
  ];
export const OPPORTUNITY_TYPES = [
  "grant",
  "job",
  "training",
  "tender",
  "funding",
  "event",
];
export const QUANTITY_UNITS = [
  "kg",
  "tonnes",
  "bags",
  "crates",
  "litres",
  "units",
  "hectares",
];
export function safeApplicationUrl(value?: string) {
  try {
    const url = new URL(value || "");
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function practicalPostError(
  kind: PostKind,
  details: PostDetails,
  country: string,
): string | null {
  if (kind === "update") return null;
  if ((details.title || "").trim().length < 5 || details.title.length > 160)
    return "Add a title of 5–160 characters.";
  if (
    (details.location || "").trim().length < 2 ||
    details.location.length > 120
  )
    return "Add a town, region, or relevant location.";
  if (country.trim().length < 2 || country.length > 80)
    return "Add a country for this post.";
  if (kind === "question" && (details.crop || "").trim().length < 2)
    return "Add the crop or subject you need help with.";
  if (kind === "listing") {
    if (!["buy", "sell"].includes(details.listing_type))
      return "Choose buying or selling.";
    if ((details.commodity || "").trim().length < 2)
      return "Name the commodity.";
    if (
      !/^\d+(\.\d+)?$/.test(details.quantity || "") ||
      Number(details.quantity) <= 0
    )
      return "Enter a positive quantity.";
    if (!QUANTITY_UNITS.includes(details.unit)) return "Choose a unit.";
    if (!/^[A-Z]{3}$/.test(details.currency || ""))
      return "Enter a three-letter currency code, such as GHS or USD.";
    if (
      details.price &&
      (!/^\d+(\.\d{1,2})?$/.test(details.price) || Number(details.price) <= 0)
    )
      return "Enter a positive price per unit, or leave it blank to negotiate.";
    if (!details.available_from) return "Choose an availability date.";
    if (details.available_from > details.deadline)
      return "Availability must start before the closing date.";
  }
  if (kind === "opportunity") {
    if (!OPPORTUNITY_TYPES.includes(details.opportunity_type))
      return "Choose an opportunity category.";
    if ((details.eligibility || "").trim().length < 10)
      return "Explain who can apply in at least 10 characters.";
    if (!safeApplicationUrl(details.url))
      return "Add a valid http or https application link.";
  }
  if (kind === "listing" || kind === "opportunity") {
    const close = Date.parse(`${details.deadline}T23:59:59.999Z`);
    if (!Number.isFinite(close) || close < Date.now())
      return "Choose a closing date that has not passed.";
  }
  return null;
}
