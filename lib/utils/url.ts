// Normalizes a user-typed URL so `type="url"` inputs (which require a full
// scheme to pass native validation) don't silently block submission when
// someone types "www.example.com" or "example.com" instead of the full URL.
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed; // already has a scheme
  return `https://${trimmed}`;
}

// Blur handler factory. Always writes the normalized value back onto the
// input directly (so uncontrolled inputs — e.g. plain `name="..."` fields
// submitted via FormData/server actions — pick it up immediately). Pass a
// setter for controlled inputs so React's state stays in sync too.
// Usage: onBlur={onUrlBlur()}                                    // uncontrolled
//        onBlur={onUrlBlur((v) => setForm({ ...form, website: v }))}  // controlled
export function onUrlBlur(setValue?: (normalized: string) => void) {
  return (e: React.FocusEvent<HTMLInputElement>) => {
    const normalized = normalizeUrl(e.target.value);
    if (normalized !== e.target.value) {
      e.target.value = normalized;
      setValue?.(normalized);
    }
  };
}
