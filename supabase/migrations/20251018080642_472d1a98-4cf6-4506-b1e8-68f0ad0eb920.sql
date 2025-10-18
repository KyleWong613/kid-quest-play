
-- Remove the old level constraint that limits lessons to level 1-10
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_level_check;

-- Add new constraint allowing levels 1-18 for advanced learners
ALTER TABLE lessons ADD CONSTRAINT lessons_level_check CHECK (level >= 1 AND level <= 18);
