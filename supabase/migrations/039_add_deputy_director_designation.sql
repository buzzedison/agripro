-- 039_add_deputy_director_designation.sql
-- Adds a third fellow designation: 'deputy_director' (Deputy Fellowship Director).
-- The public directory view selects `designation` as a pass-through column, so
-- it needs no changes — only the CHECK constraint on the base table is widened.

ALTER TABLE public.catalyst_fellows
  DROP CONSTRAINT IF EXISTS catalyst_fellows_designation_check;

ALTER TABLE public.catalyst_fellows
  ADD CONSTRAINT catalyst_fellows_designation_check
  CHECK (designation IN ('fellow', 'director', 'deputy_director'));
