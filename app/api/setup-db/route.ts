import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
    try {
        const connectionString = process.env.DATABASE_URL
        if (!connectionString) {
            return NextResponse.json({ error: 'DATABASE_URL is not set in environment variables.' }, { status: 400 })
        }

        const pool = new Pool({
            connectionString,
        })

        const kpiSql = `
      create table if not exists public.kpi_scores (
        id            uuid primary key default gen_random_uuid(),
        employee_id   uuid not null references public.users(id) on delete cascade,
        manager_id    uuid not null references public.users(id) on delete cascade,
        metric_name   text not null,
        target_value  numeric not null check (target_value > 0),
        actual_value  numeric,
        score         numeric,           
        status        text check (status in ('Excellent', 'Good', 'Average', 'Needs Improvement')),
        period        text not null,     
        notes         text,
        created_at    timestamptz not null default now(),
        updated_at    timestamptz not null default now()
      );

      create index if not exists kpi_scores_employee_id_idx on public.kpi_scores(employee_id);
      create index if not exists kpi_scores_manager_id_idx  on public.kpi_scores(manager_id);

      alter table public.kpi_scores enable row level security;

      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kpi_scores' AND policyname = 'Employees can view their own KPIs') THEN
          execute 'create policy "Employees can view their own KPIs" on public.kpi_scores for select using (employee_id = auth.uid())';
        END IF;
      END $$;

      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kpi_scores' AND policyname = 'Managers can view KPIs they manage') THEN
          execute 'create policy "Managers can view KPIs they manage" on public.kpi_scores for select using (manager_id = auth.uid())';
        END IF;
      END $$;

      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kpi_scores' AND policyname = 'Managers can create KPIs') THEN
          execute 'create policy "Managers can create KPIs" on public.kpi_scores for insert with check (manager_id = auth.uid())';
        END IF;
      END $$;

      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kpi_scores' AND policyname = 'Managers can update KPIs they manage') THEN
          execute 'create policy "Managers can update KPIs they manage" on public.kpi_scores for update using (manager_id = auth.uid())';
        END IF;
      END $$;

      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kpi_scores' AND policyname = 'Managers can delete KPIs they manage') THEN
          execute 'create policy "Managers can delete KPIs they manage" on public.kpi_scores for delete using (manager_id = auth.uid())';
        END IF;
      END $$;
    `

        // Execute the SQL creation script
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            await client.query(kpiSql)
            await client.query('COMMIT')
            return NextResponse.json({ message: 'KPI Database setup successfully created!' }, { status: 200 })
        } catch (e: any) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
            await pool.end()
        }

    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
