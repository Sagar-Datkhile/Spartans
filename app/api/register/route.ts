import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { token, email, password, pendingId } = body

        if (!token || !email || !password || !pendingId) {
            return NextResponse.json({ error: 'Missing required registration data.' }, { status: 400 })
        }

        // 1. Double-check token validates on the server
        const { data: invite, error: fetchErr } = await supabaseAdmin
            .from('invites')
            .select('*')
            .eq('token', token)
            .eq('id', pendingId)
            .single()

        if (fetchErr || !invite) {
            return NextResponse.json({ error: 'Invalid invitation token.' }, { status: 400 })
        }

        if (invite.status === 'completed') {
            return NextResponse.json({ error: 'Account already active.' }, { status: 400 })
        }

        if (new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Invitation expired.' }, { status: 400 })
        }

        if (invite.email !== email) {
            return NextResponse.json({ error: 'Email mismatch.' }, { status: 400 })
        }

        // 2. Create the user in Supabase Auth securely
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name: invite.name }
        })

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Failed to create auth user.' }, { status: 500 })
        }

        // 3. Create the User Profile in public.users
        const { error: profileError } = await supabaseAdmin.from('users').insert({
            id: authData.user.id,
            email: invite.email,
            name: invite.name,
            role: invite.role,
            manager_id: invite.manager_id,
            created_at: new Date().toISOString()
        })

        if (profileError) {
            // Rollback Auth user if profile insert fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: 'Database error creating profile: ' + profileError.message }, { status: 500 })
        }

        // 4. Mark invite as completed
        await supabaseAdmin
            .from('invites')
            .update({ status: 'completed' })
            .eq('id', pendingId)

        return NextResponse.json({
            success: true,
            message: 'Registration successful!'
        }, { status: 200 })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
