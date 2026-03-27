-- Migration: Add type column to Label table
-- This script adds the missing 'type' column to support different label types

-- Check if the column already exists (SQLite doesn't support IF NOT EXISTS for columns)
-- We'll use a more robust approach

-- First, let's create a backup table structure
CREATE TABLE IF NOT EXISTS Label_backup AS SELECT * FROM Label WHERE 1=0;

-- Add the type column with default value
-- For SQLite, we need to use ALTER TABLE ADD COLUMN
ALTER TABLE Label ADD COLUMN type TEXT DEFAULT 'oqc';

-- Update any existing records to have the default type
UPDATE Label SET type = 'oqc' WHERE type IS NULL OR type = '';

-- Verify the migration
SELECT COUNT(*) as total_labels, 
       COUNT(CASE WHEN type = 'oqc' THEN 1 END) as oqc_labels,
       COUNT(CASE WHEN type = 'bin' THEN 1 END) as bin_labels,
       COUNT(CASE WHEN type = 'palet' THEN 1 END) as palet_labels
FROM Label;

-- Migration completed successfully
SELECT 'Migration completed: type column added to Label table' as status;
