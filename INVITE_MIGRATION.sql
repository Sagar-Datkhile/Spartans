-- 1. Clean up the users table (Remove columns that cause FK issues)
ALTER TABLE public.users 
DROP COLUMN IF EXISTS invited_by,
DROP COLUMN IF EXISTS invite_token,
DROP COLUMN IF EXISTS invite_expires,
DROP COLUMN IF EXISTS status;

-- 2. Create a dedicated Invites table
CREATE TABLE IF NOT EXISTS public.invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    invited_by uuid REFERENCES public.users(id) ON DELETE CASCADE,
    manager_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    token text UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired'))
);

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS invites_token_idx ON public.invites(token);
CREATE INDEX IF NOT EXISTS invites_email_idx ON public.invites(email);

-- 4. Enable RLS (Optional, but recommended)
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Super Admins and Managers can view/create invites
CREATE POLICY "Managers can manage invites" ON public.invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('SUPERADMIN', 'MANAGER')
        )
    );
