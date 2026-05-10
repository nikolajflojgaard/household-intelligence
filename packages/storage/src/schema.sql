CREATE TABLE IF NOT EXISTS input_snapshots (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  payload_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recommendation_runs (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  surface TEXT,
  result_json TEXT NOT NULL,
  brief_json TEXT,
  FOREIGN KEY (snapshot_id) REFERENCES input_snapshots(id)
);

CREATE TABLE IF NOT EXISTS recommendation_actions (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  title TEXT NOT NULL,
  score REAL NOT NULL,
  urgency TEXT NOT NULL,
  owner_id TEXT,
  payload_json TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES recommendation_runs(id)
);

CREATE TABLE IF NOT EXISTS feedback_events (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL,
  event TEXT NOT NULL,
  actor_id TEXT,
  created_at TEXT NOT NULL,
  payload_json TEXT NOT NULL
);
