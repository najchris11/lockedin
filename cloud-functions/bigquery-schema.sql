-- BigQuery Schema Setup for LockIn Analytics
-- Run these SQL commands in BigQuery Console

-- Create dataset
CREATE SCHEMA IF NOT EXISTS `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics`
OPTIONS (
  description = "LockIn productivity analytics data",
  location = "US"
);

-- Focus metrics table
CREATE TABLE IF NOT EXISTS `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.focus_metrics` (
  user_id STRING NOT NULL,
  session_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  focus_score FLOAT64,
  eye_contact_time FLOAT64,
  distraction_count INT64,
  posture_score FLOAT64,
  environment_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY user_id, session_id;

-- Pomodoro sessions table
CREATE TABLE IF NOT EXISTS `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.pomodoro_sessions` (
  user_id STRING NOT NULL,
  session_id STRING NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INT64,
  type STRING,
  completed BOOLEAN,
  focus_score FLOAT64,
  distractions JSON,
  break_activities JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(start_time)
CLUSTER BY user_id, session_id;

-- Distraction events table
CREATE TABLE IF NOT EXISTS `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.distraction_events` (
  user_id STRING NOT NULL,
  session_id STRING NOT NULL,
  distraction_type STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY user_id, session_id;

-- Create views for common queries

-- Daily focus summary view
CREATE OR REPLACE VIEW `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.daily_focus_summary` AS
SELECT 
  user_id,
  DATE(timestamp) as date,
  AVG(focus_score) as avg_focus_score,
  COUNT(*) as session_count,
  SUM(eye_contact_time) as total_focus_time,
  AVG(distraction_count) as avg_distractions
FROM `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.focus_metrics`
GROUP BY user_id, DATE(timestamp);

-- Weekly productivity trends view
CREATE OR REPLACE VIEW `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.weekly_productivity` AS
SELECT 
  user_id,
  EXTRACT(WEEK FROM start_time) as week,
  EXTRACT(YEAR FROM start_time) as year,
  COUNT(*) as total_sessions,
  AVG(focus_score) as avg_focus_score,
  SUM(duration) as total_focus_time,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_sessions
FROM `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.pomodoro_sessions`
GROUP BY user_id, EXTRACT(WEEK FROM start_time), EXTRACT(YEAR FROM start_time);

-- Hourly focus patterns view
CREATE OR REPLACE VIEW `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.hourly_focus_patterns` AS
SELECT 
  user_id,
  EXTRACT(HOUR FROM timestamp) as hour,
  AVG(focus_score) as avg_focus_score,
  COUNT(*) as session_count,
  AVG(distraction_count) as avg_distractions
FROM `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.focus_metrics`
GROUP BY user_id, EXTRACT(HOUR FROM timestamp);

-- Create indexes for better performance
-- Note: BigQuery automatically creates indexes for clustered columns

-- Sample data insertion for testing
INSERT INTO `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.focus_metrics` 
(user_id, session_id, timestamp, focus_score, eye_contact_time, distraction_count, posture_score, environment_data)
VALUES 
('test-user-1', 'session-1', CURRENT_TIMESTAMP(), 85.5, 1200.0, 2, 78.0, '{"lighting": "good", "noise_level": "low"}'),
('test-user-1', 'session-2', CURRENT_TIMESTAMP(), 72.3, 900.0, 5, 65.0, '{"lighting": "dim", "noise_level": "medium"}');

INSERT INTO `qwiklabs-gcp-02-722b4bd68f49.lockedin_analytics.pomodoro_sessions`
(user_id, session_id, start_time, end_time, duration, type, completed, focus_score, distractions, break_activities)
VALUES 
('test-user-1', 'session-1', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 25 MINUTE), CURRENT_TIMESTAMP(), 25, 'focus', true, 85.5, '["phone", "email"]', '["walk", "stretch"]'),
('test-user-1', 'session-2', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE), NULL, 5, 'break', false, 0, '[]', '["coffee", "chat"]');
