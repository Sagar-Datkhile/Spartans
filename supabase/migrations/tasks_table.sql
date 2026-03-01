-- Create the tasks table
CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    status text DEFAULT 'TODO'::text,
    priority text DEFAULT 'MEDIUM'::text,
    project_name text,
    assignee_id uuid REFERENCES public.users(id),
    due_date date,
    created_at timestamp with time zone DEFAULT now()
);

-- Turn on Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can select tasks
-- Note: In a real production app, you might restrict this to team members
CREATE POLICY "Enable read access for all users" ON public.tasks FOR SELECT USING (true);

-- Policy: Authenticated users can insert tasks
CREATE POLICY "Enable insert for authenticated users only" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update tasks
CREATE POLICY "Enable update for authenticated users only" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete tasks
CREATE POLICY "Enable delete for authenticated users only" ON public.tasks FOR DELETE USING (auth.role() = 'authenticated');
