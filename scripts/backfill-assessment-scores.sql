-- Backfill assessment scores for submissions completed before auto-grading was added.
--
-- Usage (from project root):
--   psql "$SUPABASE_DB_URL" -f scripts/backfill-assessment-scores.sql
--
-- The script:
--   1. Sets multiple-choice responses to the appropriate max points when answered correctly.
--   2. Recomputes total and maximum scores per invitation in assessment_results.
--   3. Updates percentage_score and keeps existing qualitative / quantitative fields intact.

BEGIN;

-- Map question_number to correct answer letter (first character of option).
WITH answer_key AS (
  SELECT * FROM (
    VALUES
      (1, 'b'),
      (2, 'b'),
      (3, 'b'),
      (4, 'c'),
      (5, 'c'),
      (6, 'b'),
      (7, 'c'),
      (8, 'b'),
      (9, 'a'),
      (10, 'b'),
      (11, 'c')
  ) AS t(question_number, correct_choice)
)
UPDATE assessment_responses ar
SET
  points_awarded = aq.max_points,
  graded_by = COALESCE(ar.graded_by, 'backfill-script'),
  graded_at = NOW()
FROM assessment_questions aq
JOIN answer_key ak ON ak.question_number = aq.question_number
WHERE
  ar.question_id = aq.id
  AND aq.question_type = 'multiple_choice'
  AND ar.response_text IS NOT NULL
  AND LEFT(BTRIM(ar.response_text), 1) ILIKE ak.correct_choice
  AND COALESCE(ar.points_awarded, 0) <> aq.max_points;

-- Recalculate totals for each invitation in assessment_results.
WITH response_totals AS (
  SELECT
    ar.invitation_id,
    SUM(ar.points_awarded) AS total_awarded,
    SUM(aq.max_points) AS total_available
  FROM assessment_responses ar
  JOIN assessment_questions aq ON aq.id = ar.question_id
  GROUP BY ar.invitation_id
)
UPDATE assessment_results result
SET
  total_score = COALESCE(rt.total_awarded, 0),
  max_score = COALESCE(rt.total_available, 0),
  percentage_score = CASE
    WHEN COALESCE(rt.total_available, 0) > 0
      THEN ROUND((rt.total_awarded::DECIMAL / rt.total_available::DECIMAL) * 100, 2)
    ELSE NULL
  END
FROM response_totals rt
WHERE rt.invitation_id = result.invitation_id;

COMMIT;

