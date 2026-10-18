import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase } from "./feed-fixture.mjs";

const db = await createTestDatabase(false);
const admin = "00000000-0000-0000-0000-0000000000b1",
  member = "00000000-0000-0000-0000-0000000000b2";
const migration = async (f) => db.exec(await readFile(new URL("../supabase/migrations/" + f, import.meta.url), "utf8"));

// Supabase grants table privileges to anon/authenticated by default; RLS does the filtering.
await db.exec(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
CREATE TABLE public.catalyst_fellows(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
INSERT INTO auth.users VALUES('${admin}','admin@test.local'),('${member}','member@test.local');
INSERT INTO admin_users VALUES('admin@test.local',true);`);
for (const f of ["031_create_catalyst_submissions.sql", "038_add_catalyst_w_participant_ops.sql", "042_add_submission_referral_source.sql", "049_add_catalyst_submission_stages.sql", "063_catalyst_selection.sql", "064_catalyst_launch.sql"])
  await migration(f);
await migration("064_catalyst_launch.sql"); // safe to rerun

const root = () => db.exec("RESET ROLE; RESET request.email;");
const as = (id, email) => db.exec(`RESET ROLE; SET request.uid='${id}'; SET request.email='${email}'; SET ROLE authenticated`);
const one = async (sql, params) => (await db.query(sql, params)).rows[0];

await root();
// Seeds: 2026 settings and the four priority countries (+ South Africa inactive).
assert.equal((await one("SELECT launch_date::text d, offer_response_days n FROM catalyst_launch_settings WHERE cohort_year=2026")).d, "2026-11-30");
assert.deepEqual((await db.query("SELECT country FROM catalyst_countries WHERE active ORDER BY country")).rows.map((r) => r.country), ["Ghana", "Kenya", "Nigeria", "Zimbabwe"]);
assert.equal((await one("SELECT active FROM catalyst_countries WHERE country='South Africa'")).active, false);

const { id: founder } = await one("INSERT INTO catalyst_submissions(type,full_name,email,country) VALUES('apply','Wanjiru K','w@farm.ke','Kenya') RETURNING id");
const { id: other } = await one("INSERT INTO catalyst_submissions(type,full_name,email) VALUES('apply','Chipo M','c@farm.zw') RETURNING id");

// Portal tokens must be long and unique.
await assert.rejects(() => db.query("UPDATE catalyst_submissions SET portal_token='short' WHERE id=$1", [founder]), /portal_token_len/);
const token = "a".repeat(64);
await db.query("UPDATE catalyst_submissions SET portal_token=$1 WHERE id=$2", [token, founder]);
await assert.rejects(() => db.query("UPDATE catalyst_submissions SET portal_token=$1 WHERE id=$2", [token, other]), /duplicate key|unique/i);

// Scholarship requests need a real explanation; one per founder.
await assert.rejects(() => db.query("INSERT INTO catalyst_scholarship_requests(submission_id,requested,circumstances) VALUES($1,'fully_funded','too short')", [founder]), /circumstances/);
await db.query("INSERT INTO catalyst_scholarship_requests(submission_id,requested,circumstances,can_contribute_usd) VALUES($1,'scholarship_199','I can pay part of the fee from this season''s harvest.',50)", [founder]);
await assert.rejects(() => db.query("UPDATE catalyst_scholarship_requests SET decision='maybe'"), /decision/);

// Offers: valid funding/status only, no negative fees, one per founder, unique payment references.
await assert.rejects(() => db.query("INSERT INTO catalyst_offers(submission_id,fee_usd,payment_deadline) VALUES($1,-1,'2026-11-13')", [founder]), /fee_usd/);
await assert.rejects(() => db.query("INSERT INTO catalyst_offers(submission_id,fee_usd,payment_deadline,funding) VALUES($1,199,'2026-11-13','free')", [founder]), /funding/);
const { id: offer } = await one("INSERT INTO catalyst_offers(submission_id,fee_usd,funding,payment_deadline,status) VALUES($1,199,'scholarship_199','2026-11-13','sent') RETURNING id", [founder]);
await assert.rejects(() => db.query("INSERT INTO catalyst_offers(submission_id,fee_usd,payment_deadline) VALUES($1,399,'2026-11-13')", [founder]), /duplicate key|unique/i);
await assert.rejects(() => db.query("UPDATE catalyst_offers SET status='paid' WHERE id=$1", [offer]), /status/);
await db.query("UPDATE catalyst_offers SET payment_reference='cw_ref_1' WHERE id=$1", [offer]);
const { id: offer2 } = await one("INSERT INTO catalyst_offers(submission_id,fee_usd,payment_deadline) VALUES($1,399,'2026-11-13') RETURNING id", [other]);
await assert.rejects(() => db.query("UPDATE catalyst_offers SET payment_reference='cw_ref_1' WHERE id=$1", [offer2]), /duplicate key|unique/i);
await db.query("INSERT INTO catalyst_payments(offer_id,reference,amount_usd) VALUES($1,'cw_pay_1',199)", [offer]);
await assert.rejects(() => db.query("INSERT INTO catalyst_payments(offer_id,reference) VALUES($1,'cw_pay_1')", [offer]), /duplicate key|unique/i);

// Groups: deleting a group unassigns founders rather than deleting them.
const { id: group } = await one("INSERT INTO catalyst_groups(name,country,venture_lead_name,contact_name) VALUES('Nairobi Growers','Kenya','A. Otieno','B. Mwangi') RETURNING id");
await db.query("UPDATE catalyst_submissions SET group_id=$1 WHERE id=$2", [group, founder]);
await db.query("DELETE FROM catalyst_groups WHERE id=$1", [group]);
assert.equal((await one("SELECT group_id FROM catalyst_submissions WHERE id=$1", [founder])).group_id, null);

// Access: admins see launch data, members see nothing, anonymous visitors are refused.
await as(admin, "admin@test.local");
assert.equal((await one("SELECT count(*)::int n FROM catalyst_offers")).n, 2);
await as(member, "member@test.local");
for (const t of ["catalyst_offers", "catalyst_scholarship_requests", "catalyst_payments", "catalyst_partners", "catalyst_budget_lines", "catalyst_countries", "catalyst_groups", "catalyst_launch_settings"])
  assert.equal((await one(`SELECT count(*)::int n FROM ${t}`)).n, 0, `${t} visible to member`);
await db.exec("RESET ROLE; SET request.uid=''; SET ROLE anon");
await assert.rejects(() => db.query("SELECT count(*) FROM catalyst_offers"), /permission denied/);
await root();

// Deleting a founder's application removes their offer, payments and scholarship request.
await db.query("DELETE FROM catalyst_submissions WHERE id=$1", [founder]);
assert.equal((await one("SELECT ((SELECT count(*) FROM catalyst_offers WHERE submission_id=$1)+(SELECT count(*) FROM catalyst_payments)+(SELECT count(*) FROM catalyst_scholarship_requests))::int n", [founder])).n, 0);

// Shared rules.
const lib = await import("../lib/catalyst-launch.ts");
const now = new Date("2026-11-14T10:00:00Z");
assert.equal(lib.isOverdue({ status: "sent", payment_deadline: "2026-11-13" }, now), true);
assert.equal(lib.isOverdue({ status: "sent", payment_deadline: "2026-11-14" }, now), false, "deadline runs to end of day UTC");
assert.equal(lib.isOverdue({ status: "confirmed", payment_deadline: "2026-11-01" }, now), false);
assert.equal(lib.defaultFee("fully_funded", { standard_fee_usd: 399 }), 0);
assert.equal(lib.defaultFee("scholarship_199", { standard_fee_usd: 399 }), 199);
assert.equal(lib.defaultFee("standard", { standard_fee_usd: 399 }), 399);
assert.deepEqual(lib.welcomeGaps({ group_id: null, next_action: "" }, null), ["No group", "No next action"]);
assert.deepEqual(lib.welcomeGaps({ group_id: "g", next_action: "Book call" }, { venture_lead_name: "A", contact_name: null }), ["Group has no contact person"]);
assert.equal(lib.sameCountry(" ghana", "Ghana "), true);
assert.equal(lib.addDays(new Date("2026-11-28T12:00:00Z"), 5), "2026-12-03");

console.log("catalyst launch migration and rules checks passed");
