-- Add a field to track if the user has changed their initial temporary password
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_changed boolean DEFAULT true;

-- For existing users, we'll assume they've already set their passwords since they exist in the DB
-- Future users invited via the system will have this set to false upon insertion.
