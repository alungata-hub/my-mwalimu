/*
# Create quiz_attempts and flashcard_reviews tables

## Purpose

This migration creates the two user-data tables for the My Mwalimu AZ-900 Study Companion app.

The app has a sign-in/sign-up screen (Supabase email/password auth), so all
data is multi-user and owner-scoped. Each signed-in user sees only their own
quiz history and flashcard ratings.

## New Tables

### 1. quiz_attempts
Stores a single completed quiz attempt.

- `id` (uuid, primary key) — unique attempt ID
- `user_id` (uuid, not null, defaults to auth.uid()) — owner of the attempt
- `score_percent` (integer, not null) — percentage score (0–100)
- `correct` (integer, not null) — number of correct answers
- `total` (integer, not null) — total questions in the quiz
- `passed` (boolean, not null, default false) — whether score >= 70%
- `timed` (boolean, not null, default false) — whether the attempt was in timed mode
- `answers` (jsonb, not null, default '[]') — array of {questionId, selectedIndex, correct}
- `completed_at` (timestamptz, not null, default now()) — when the attempt was finished

### 2. flashcard_reviews
Stores a single flashcard rating (one row per user + card, upserted).

- `id` (uuid, primary key) — unique review ID
- `user_id` (uuid, not null, defaults to auth.uid()) — owner of the review
- `card_id` (text, not null) — flashcard identifier from the static card set
- `rating` (text, not null) — 'known' or 'needs-revision'
- `reviewed_at` (timestamptz, not null, default now()) — last time the rating was set
- Unique constraint on (user_id, card_id) so each user has at most one rating per card

## Security

Both tables:
- Row Level Security enabled.
- CRUD granted to `authenticated` only (the app requires sign-in; `anon` has no access).
- Owner-scoped policies: each authenticated user can only SELECT, INSERT, UPDATE,
  and DELETE rows where `user_id = auth.uid()`.
- The `DEFAULT auth.uid()` on `user_id` lets the frontend insert without passing
  `user_id` explicitly — the database fills it from the session.

## Indexes

- `quiz_attempts` on `user_id` + `completed_at DESC` — dashboard loads recent attempts per user
- `flashcard_reviews` on `user_id` — loading all of a user's card ratings
- `flashcard_reviews` unique on `(user_id, card_id)` — upsert support, one rating per card per user
*/

-- ── quiz_attempts ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  score_percent integer NOT NULL,
  correct integer NOT NULL,
  total integer NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  timed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_attempts TO authenticated;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed
  ON quiz_attempts (user_id, completed_at DESC);

DROP POLICY IF EXISTS "select_own_attempts" ON quiz_attempts;
CREATE POLICY "select_own_attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attempts" ON quiz_attempts;
CREATE POLICY "insert_own_attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attempts" ON quiz_attempts;
CREATE POLICY "update_own_attempts"
  ON quiz_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attempts" ON quiz_attempts;
CREATE POLICY "delete_own_attempts"
  ON quiz_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── flashcard_reviews ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('known', 'needs-revision')),
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON flashcard_reviews TO authenticated;

CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user
  ON flashcard_reviews (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_flashcard_reviews_user_card
  ON flashcard_reviews (user_id, card_id);

DROP POLICY IF EXISTS "select_own_reviews" ON flashcard_reviews;
CREATE POLICY "select_own_reviews"
  ON flashcard_reviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reviews" ON flashcard_reviews;
CREATE POLICY "insert_own_reviews"
  ON flashcard_reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reviews" ON flashcard_reviews;
CREATE POLICY "update_own_reviews"
  ON flashcard_reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reviews" ON flashcard_reviews;
CREATE POLICY "delete_own_reviews"
  ON flashcard_reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
