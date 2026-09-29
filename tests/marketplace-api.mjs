// Read-only API smoke checks. Start the local app and set MARKETPLACE_TEST_URL if needed.
import assert from "node:assert/strict";
const base = process.env.MARKETPLACE_TEST_URL || "http://localhost:3001";
async function get(path, expected = 200) {
  const response = await fetch(base + path);
  assert.equal(response.status, expected, path);
  return response.json();
}
for (const term of ["maize,beans", "Alshams", '"quoted"', "100%", "_"]) {
  const data = await get(
    "/api/trade/vendors?search=" + encodeURIComponent(term),
  );
  assert.ok(Array.isArray(data.vendors));
  assert.ok(data.vendors.length <= 12);
}
const first = await get("/api/trade/vendors?limit=2&page=1"),
  second = await get("/api/trade/vendors?limit=2&page=2");
assert.equal(first.pagination.page, 1);
assert.equal(second.pagination.page, 2);
assert.equal(first.pagination.total, second.pagination.total);
assert.ok(
  second.vendors.every(
    (v) => !first.vendors.some((previous) => previous.id === v.id),
  ),
);
const verified = await get("/api/trade/vendors?verified=true");
assert.ok(verified.vendors.every((v) => v.is_verified));
const missing = await get(
  "/api/trade/products?category=no-such-category-audit",
);
assert.equal(missing.products.length, 0);
assert.equal(missing.pagination.total, 0);
const bounded = await get("/api/trade/products?page=-1&limit=999999");
assert.equal(bounded.pagination.page, 1);
assert.equal(bounded.pagination.limit, 50);
assert.ok(bounded.products.length <= 50);
await get("/api/trade/products?min=10", 400);
await get("/api/trade/products?currency=GHS&min=20&max=10", 400);
await get("/api/admin/trade/vendors", 401);
await get("/api/admin/trade/stats", 401);
console.log(
  "PASS: marketplace punctuation search, pagination, verified filter, unknown categories, bounded requests, price validation and anonymous admin denial.",
);
