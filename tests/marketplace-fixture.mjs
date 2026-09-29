import { readFile } from "node:fs/promises";
import { createTestDatabase } from "./feed-fixture.mjs";
export async function createMarketplaceDatabase(
  beforeSecurity = async () => {},
) {
  const db = await createTestDatabase(true);
  await db.exec(`
 CREATE FUNCTION auth.email() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.email',true),'') $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
 GRANT SELECT ON admin_users TO authenticated,anon;
 CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
 CREATE SCHEMA storage;
 CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text,UNIQUE(bucket_id,name));
 ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA storage TO authenticated,anon;
 GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO authenticated; GRANT SELECT ON storage.objects TO anon;
 CREATE TABLE notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,actor_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,type text NOT NULL CHECK(type IN ('mention','like','comment','repost','follow','connection_request','connection_accepted')),post_id uuid REFERENCES posts ON DELETE CASCADE,comment_id uuid REFERENCES post_comments ON DELETE CASCADE,message text NOT NULL,read boolean DEFAULT false,created_at timestamptz DEFAULT now());
 ALTER TABLE notifications ENABLE ROW LEVEL SECURITY; GRANT ALL ON notifications TO authenticated;
 CREATE POLICY own_read ON notifications FOR SELECT USING(user_id=auth.uid());CREATE POLICY own_update ON notifications FOR UPDATE USING(user_id=auth.uid());CREATE POLICY own_delete ON notifications FOR DELETE USING(user_id=auth.uid());CREATE POLICY system_insert ON notifications FOR INSERT WITH CHECK(true);
 `);
  for (const name of [
    "005_create_trade_tables.sql",
    "010_fix_vendor_admin_policy.sql",
    "011_vendor_verification_system.sql",
    "023_create_vendor_documents_bucket.sql",
    "024_add_trade_vendor_verification_status.sql",
    "025_update_vendor_visibility_policies.sql",
    "026_add_trade_product_currency.sql",
    "057_practical_feed_posts.sql",
    "058_feed_interests_and_alerts.sql",
    "059_enquiry_conversations.sql",
    "060_marketplace_security.sql",
    "061_marketplace_enquiries.sql",
  ]) {
    if (name === "060_marketplace_security.sql") await beforeSecurity(db);
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/" + name, import.meta.url),
        "utf8",
      ),
    );
  }
  return db;
}
