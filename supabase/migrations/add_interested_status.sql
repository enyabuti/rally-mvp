-- Migration: Add 'interested' status to members table
-- Date: 2026-03-06

-- Drop existing constraint
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;

-- Add new constraint with 'interested' status
ALTER TABLE members ADD CONSTRAINT members_status_check
CHECK (status IN ('pending', 'committed', 'withdrawn', 'interested'));
