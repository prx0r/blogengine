-- Add profile JSON column to users table for birth chart, psyche map, etc.
ALTER TABLE users ADD COLUMN profile JSON NOT NULL DEFAULT '{}';

-- Create index on user profiles for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_profile ON users(display_name);
