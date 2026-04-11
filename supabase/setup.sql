-- Run this in the Supabase SQL Editor to create the activities table
-- Dashboard > SQL Editor > New Query > paste & run

CREATE TABLE IF NOT EXISTS activities (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  strava_id    TEXT UNIQUE NOT NULL,
  athlete_id   TEXT NOT NULL,
  type         TEXT NOT NULL,           -- 'run', 'walk', 'cycle'
  date         TEXT NOT NULL,           -- 'YYYY-MM-DD'
  distance_km  NUMERIC(8,2) DEFAULT 0,
  duration_sec INTEGER DEFAULT 0,
  elevation_m  INTEGER DEFAULT 0,
  name         TEXT DEFAULT '',
  source       TEXT DEFAULT 'strava',
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by athlete
CREATE INDEX IF NOT EXISTS idx_activities_athlete ON activities (athlete_id);

-- Enable Row Level Security (allows anon key to insert/read)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (needed for anon key upsert)
CREATE POLICY "Allow public insert" ON activities
  FOR INSERT WITH CHECK (true);

-- Policy: anyone can read all activities
CREATE POLICY "Allow public select" ON activities
  FOR SELECT USING (true);

-- Policy: allow upsert (update on conflict)
CREATE POLICY "Allow public update" ON activities
  FOR UPDATE USING (true) WITH CHECK (true);
