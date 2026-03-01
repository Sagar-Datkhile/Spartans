import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET(req: NextRequest) {
    try {
        const connectionString = process.env.DATABASE_URL
        if (!connectionString) {
            return NextResponse.json({ error: 'DATABASE_URL is not set in .env.local' }, { status: 400 })
        }

        const pool = new Pool({ connectionString })
        const client = await pool.connect()

        const inviteSql = `
      -- 1. Create the status type if it doesn't exist
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
              CREATE TYPE user_status AS ENUM ('pending', 'active');
          END IF;
      END $$;

      -- 2. Add invitation columns to public.users
      ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS invite_token text,
      ADD COLUMN IF NOT EXISTS invite_expires timestamptz,
      ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'pending';

      -- 3. Create index
      CREATE INDEX IF NOT EXISTS users_invite_token_idx ON public.users(invite_token);
    `

        try {
            await client.query(inviteSql)
            return NextResponse.json({ message: 'Success! Your database is now ready for the Invitation System.' })
        } finally {
            client.release()
            await pool.end()
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
