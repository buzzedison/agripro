"use client";
import {
  OPPORTUNITY_TYPES,
  PostDetails,
  PostKind,
  QUANTITY_UNITS,
} from "@/lib/practical-feed";

export default function PracticalPostFields({
  kind,
  details,
  onChange,
  country,
  onCountryChange,
  disabled = false,
}: {
  kind: PostKind;
  details: PostDetails;
  onChange: (details: PostDetails) => void;
  country: string;
  onCountryChange: (country: string) => void;
  disabled?: boolean;
}) {
  if (kind === "update") return null;
  const change = (key: string, value: string) =>
    onChange({ ...details, [key]: value });
  const field = (
    key: string,
    label: string,
    placeholder = "",
    type = "text",
    maxLength = 160,
  ) => (
    <label className="block text-xs font-semibold text-gray-600">
      {label}
      <input
        type={type}
        value={details[key] || ""}
        onChange={(e) => change(key, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className="mt-1 min-w-0 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
      />
    </label>
  );
  const select = (key: string, label: string, items: string[]) => (
    <label className="block text-xs font-semibold text-gray-600">
      {label}
      <select
        value={details[key] || ""}
        onChange={(e) => change(key, e.target.value)}
        disabled={disabled}
        className="mt-1 min-w-0 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal capitalize"
      >
        <option value="">Choose…</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <fieldset
      disabled={disabled}
      className="mb-3 space-y-3 rounded-xl border border-green-100 bg-green-50/40 p-3 sm:p-4"
    >
      <legend className="px-1 text-xs font-semibold text-green-800">
        {kind === "question"
          ? "Help the community give a useful answer"
          : kind === "listing"
            ? "Make your offer easy to assess"
            : "Help the right people apply"}
      </legend>
      {field(
        "title",
        kind === "question" ? "Your question" : "Title",
        kind === "question"
          ? "Why are my tomato leaves turning yellow?"
          : kind === "listing"
            ? "Fresh maize available in Tamale"
            : "Training opportunity for young farmers",
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {field(
          "location",
          "Town / region",
          "e.g. Tamale or remote",
          "text",
          120,
        )}
        <label className="block text-xs font-semibold text-gray-600">
          Country
          <input
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            maxLength={80}
            placeholder="e.g. Ghana"
            className="mt-1 min-w-0 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal"
          />
        </label>
      </div>
      {kind === "question" &&
        field(
          "crop",
          "Crop or subject",
          "e.g. Tomatoes, irrigation, farm finance",
          "text",
          80,
        )}
      {kind === "listing" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {select("listing_type", "I want to", ["sell", "buy"])}
            {field("commodity", "Commodity", "e.g. Maize", "text", 80)}
            {field("quantity", "Quantity", "e.g. 500", "text", 20)}
            {select("unit", "Unit", QUANTITY_UNITS)}
            {field(
              "price",
              "Price per unit (optional)",
              "Leave blank to negotiate",
              "text",
              20,
            )}
            <label className="block text-xs font-semibold text-gray-600">
              Currency
              <input
                value={details.currency || ""}
                onChange={(e) =>
                  change("currency", e.target.value.toUpperCase())
                }
                placeholder="GHS"
                maxLength={3}
                className="mt-1 min-w-0 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal"
              />
            </label>
            {field("available_from", "Available from", "", "date")}
            {field("deadline", "Listing closes", "", "date")}
          </div>
          <p className="text-xs text-gray-500">
            Enquiries are private. No payment is collected through this post.
          </p>
        </>
      )}
      {kind === "opportunity" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {select("opportunity_type", "Category", OPPORTUNITY_TYPES)}
            {field("deadline", "Application deadline", "", "date")}
          </div>
          {field("url", "Official application link", "https://…", "url", 1000)}
          <label className="block text-xs font-semibold text-gray-600">
            Who can apply?
            <textarea
              value={details.eligibility || ""}
              onChange={(e) => change("eligibility", e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Location, experience, age or other eligibility requirements…"
              className="mt-1 min-w-0 w-full rounded-lg border border-gray-200 p-3 text-sm font-normal"
            />
          </label>
        </>
      )}
      {kind !== "question" && (
        <p className="text-xs text-gray-500">
          Closing dates end at 23:59 UTC. Expired posts leave the active feed.
        </p>
      )}
    </fieldset>
  );
}
