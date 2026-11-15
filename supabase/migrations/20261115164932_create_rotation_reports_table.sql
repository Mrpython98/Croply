/*
# Create rotation_reports table for Crop Rotation Advisor

1. New Tables
- `rotation_reports`
  - `id` (uuid, primary key)
  - `session_label` (text, optional label for the report)
  - `region_id` (text, identifier for the selected US region)
  - `region_name` (text, human-readable region name)
  - `soil_type` (text, selected soil type)
  - `priority` (text, optimization priority key)
  - `climate_data` (jsonb, cached NASA POWER climate summary)
  - `rotation_scores` (jsonb, array of scored rotation plans)
  - `best_rotation_id` (text, id of the top-scored rotation)
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `rotation_reports`.
- Grant CRUD to `anon` + `authenticated` so the no-auth frontend can read/write.
- Allow anon + authenticated full CRUD because data is intentionally public/shared (single-tenant tool).
*/

CREATE TABLE IF NOT EXISTS rotation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_label text,
  region_id text NOT NULL,
  region_name text NOT NULL,
  soil_type text NOT NULL,
  priority text NOT NULL,
  climate_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  rotation_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_rotation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rotation_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON rotation_reports TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_reports" ON rotation_reports;
CREATE POLICY "anon_select_reports"
  ON rotation_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON rotation_reports;
CREATE POLICY "anon_insert_reports"
  ON rotation_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON rotation_reports;
CREATE POLICY "anon_update_reports"
  ON rotation_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON rotation_reports;
CREATE POLICY "anon_delete_reports"
  ON rotation_reports FOR DELETE
  TO anon, authenticated USING (true);