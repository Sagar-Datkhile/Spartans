-- Enterprise-grade RBAC database schema with invite-based onboarding, strict multi-tenant isolation, analytics-ready structure, and secure Supabase integration.

-- ==========================================
-- 1. Custom Types / Enums
-- ==========================================
CREATE TYPE user_role_type AS ENUM ('SUPERADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED');

-- ==========================================
-- 2. Tables
-- ==========================================

-- Companies (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles Definition
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role_type UNIQUE NOT NULL, 
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate roles
INSERT INTO roles (name, description) VALUES
    ('SUPERADMIN', 'Full platform access and company management'),
    ('MANAGER', 'Can manage employees and oversee projects/tasks'),
    ('EMPLOYEE', 'Limited access restricted to assigned tasks and projects');

-- Users Profiles (Extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Junction
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Invitations
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status invitation_status DEFAULT 'PENDING',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    dependency UUID REFERENCES tasks(id) ON DELETE SET NULL,
    priority task_priority DEFAULT 'MEDIUM',
    status task_status DEFAULT 'TODO',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI Logs (Analytics tracking)
CREATE TABLE kpi_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- Audit Logs (Admin tracking visibility)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. Indexes for Multi-tenant Optimization
-- ==========================================
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_company ON user_roles(company_id);
CREATE INDEX idx_invitations_company ON invitations(company_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_kpi_logs_company ON kpi_logs(company_id);
CREATE INDEX idx_kpi_logs_user ON kpi_logs(user_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);

-- ==========================================
-- 4. RLS Support Functions
-- ==========================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT company_id FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS user_role_type[]
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT array_agg(r.name)
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid();
$$;

-- ==========================================
-- 5. Row Level Security Enablement
-- ==========================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. Row Level Security Policies
-- ==========================================

-- Companies
CREATE POLICY "Users view own company"
ON companies FOR SELECT
USING (id = get_user_company_id());

CREATE POLICY "Superadmins can update their company"
ON companies FOR UPDATE
USING (id = get_user_company_id() AND 'SUPERADMIN' = ANY(get_user_roles()));

-- Users (Profiles)
CREATE POLICY "Users view users in same company"
ON users FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Superadmins can insert users in company"
ON users FOR INSERT
WITH CHECK (company_id = get_user_company_id() AND 'SUPERADMIN' = ANY(get_user_roles()));

CREATE POLICY "Managers can insert employees in company"
ON users FOR INSERT
WITH CHECK (company_id = get_user_company_id() AND 'MANAGER' = ANY(get_user_roles()));

CREATE POLICY "Superadmins manage all users in company"
ON users FOR UPDATE
USING (company_id = get_user_company_id() AND 'SUPERADMIN' = ANY(get_user_roles()));

CREATE POLICY "Managers update employees but not superadmins"
ON users FOR UPDATE
USING (
    company_id = get_user_company_id() AND 
    'MANAGER' = ANY(get_user_roles()) AND
    NOT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = users.id AND r.name = 'SUPERADMIN'
    )
);

CREATE POLICY "Employees update own profile"
ON users FOR UPDATE
USING (id = auth.uid() AND company_id = get_user_company_id());

-- Roles and User Roles
CREATE POLICY "All users can read roles"
ON roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users view user_roles in same company"
ON user_roles FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Superadmins and Managers can assign user roles"
ON user_roles FOR INSERT
WITH CHECK (
    company_id = get_user_company_id() AND 
    ARRAY['SUPERADMIN', 'MANAGER']::user_role_type[] && get_user_roles()
);

-- Invitations
CREATE POLICY "Users view invitations in company"
ON invitations FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Superadmin insert any invitation for company"
ON invitations FOR INSERT
WITH CHECK (
    company_id = get_user_company_id() AND
    'SUPERADMIN' = ANY(get_user_roles())
);

CREATE POLICY "Manager insert employee invitation only"
ON invitations FOR INSERT
WITH CHECK (
    company_id = get_user_company_id() AND
    'MANAGER' = ANY(get_user_roles()) AND
    role = 'EMPLOYEE'
);

CREATE POLICY "Superadmins and Managers manage invitations"
ON invitations FOR UPDATE
USING (
    company_id = get_user_company_id() AND
    ARRAY['SUPERADMIN', 'MANAGER']::user_role_type[] && get_user_roles()
);

-- Projects
CREATE POLICY "Users view projects in company"
ON projects FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Superadmins and Managers manage projects"
ON projects FOR ALL
USING (
    company_id = get_user_company_id() AND
    ARRAY['SUPERADMIN', 'MANAGER']::user_role_type[] && get_user_roles()
);

-- Tasks
CREATE POLICY "Users view tasks in company"
ON tasks FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Superadmins and Managers manage tasks"
ON tasks FOR ALL
USING (
    company_id = get_user_company_id() AND
    ARRAY['SUPERADMIN', 'MANAGER']::user_role_type[] && get_user_roles()
);

CREATE POLICY "Employees update assigned tasks"
ON tasks FOR UPDATE
USING (
    company_id = get_user_company_id() AND
    assignee_id = auth.uid() AND
    'EMPLOYEE' = ANY(get_user_roles())
);

-- KPI Logs
CREATE POLICY "Users view company KPI logs"
ON kpi_logs FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Users can create their own KPI logs"
ON kpi_logs FOR INSERT
WITH CHECK (
    company_id = get_user_company_id() AND
    user_id = auth.uid()
);

-- Audit Logs
CREATE POLICY "Superadmins and Managers view audit logs"
ON audit_logs FOR SELECT
USING (
    company_id = get_user_company_id() AND
    ARRAY['SUPERADMIN', 'MANAGER']::user_role_type[] && get_user_roles()
);
