# Supabase Database Setup Guide

Welcome to the Supabase setup guide for the Spartans project. Copy and run the following SQL script directly inside the **SQL Editor** in your Supabase project dashboard to generate the entire PostgreSQL schema, which perfectly maps all your previous Firestore collections into structured, relational tables.

## 1. Complete Supabase SQL Schema

```sql
-- ==========================================
-- 1. ENUMS (Custom Types)
-- ==========================================
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE company_status AS ENUM ('active', 'inactive');
CREATE TYPE project_status AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE asset_status AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED');
CREATE TYPE risk_status AS ENUM ('OPEN', 'MITIGATED', 'CLOSED');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Companies Table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  logo TEXT,
  address TEXT,
  country TEXT,
  status company_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (Hooks into auth.users automatically provided by Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'EMPLOYEE',
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  phone TEXT,
  status account_status DEFAULT 'pending',
  created_by UUID REFERENCES users(id), -- Self referencing for inviter
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments Table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  status company_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add department_id to users after departments is created
ALTER TABLE users ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'PLANNING',
  start_date DATE,
  end_date DATE,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_member_ids UUID[], -- Array of user UUIDs
  budget NUMERIC,
  kpi_target NUMERIC,
  risk_level risk_level DEFAULT 'MEDIUM',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status task_status DEFAULT 'TODO',
  priority task_priority DEFAULT 'MEDIUM',
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  dependencies UUID[], -- Array of task UUIDs
  attachments TEXT[], -- Array of file URLs
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets Table
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status asset_status DEFAULT 'AVAILABLE',
  current_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  location TEXT,
  value NUMERIC,
  purchase_date DATE,
  expiry_date DATE,
  serial_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI Metrics Table
CREATE TABLE kpi_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  unit TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Assessments Table
CREATE TABLE risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  risk_name TEXT NOT NULL,
  description TEXT,
  likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER CHECK (impact BETWEEN 1 AND 5),
  mitigation TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status risk_status DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 3. AUTOMATIC TIMESTAMPS (Triggers)
-- ==========================================
-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach the trigger to all tables
CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assets_modtime BEFORE UPDATE ON assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_risk_assessments_modtime BEFORE UPDATE ON risk_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS for all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Example Basic Policy: Allow authenticated users to read data where they belong to the same company
CREATE POLICY "Users can view their own company" 
  ON companies FOR SELECT USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view everyone in their company" 
  ON users FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view tasks linked to their company projects" 
  ON tasks FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
  );
```

## 2. Connecting Supabase to Your Next.js App

1. Ensure the required Supabase packages are installed in your app:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. Add your environment variables into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-from-supabase-dashboard
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-role-key-from-supabase
   ```

3. Create the client wrapper `lib/supabase.ts`:
   ```typescript
   import { createBrowserClient } from '@supabase/ssr'

   export const createClient = () => {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }
   ```
