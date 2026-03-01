import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/client'
import crypto from 'crypto'
import { sendEmail } from '@/lib/services/mail'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, name, role } = body

        if (!email || !name || !role) {
            return NextResponse.json({ error: 'Email, name, and role are required' }, { status: 400 })
        }

        // 1. Identify the logged-in user securely
        // Note: Using the client supabase allows auth propagation from cookies if set up, 
        // otherwise passing auth token in Authorization header.
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 })
        }

        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
        }

        // Fetch user from public.users to get their role
        const { data: inviter, error: inviterErr } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('id', user.id)
            .single()

        if (inviterErr || !inviter) {
            return NextResponse.json({ error: 'Failed to access inviter profile' }, { status: 403 })
        }

        // 2. Role-based validation
        // Admin -> allow Manager or Employee
        // Manager -> allow Employee only
        // Employee -> deny
        if (inviter.role === 'EMPLOYEE') {
            return NextResponse.json({ error: 'Employees are not allowed to send invites' }, { status: 403 })
        }

        if (inviter.role === 'MANAGER' && role !== 'EMPLOYEE') {
            return NextResponse.json({ error: 'Managers can only invite Employees' }, { status: 403 })
        }

        if (inviter.role === 'SUPERADMIN' && !['MANAGER', 'EMPLOYEE'].includes(role.toUpperCase())) {
            return NextResponse.json({ error: 'Admins can only invite Managers or Employees' }, { status: 403 })
        }

        // 3. Generate secure invite token and expiration
        const token = crypto.randomBytes(32).toString('hex')
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

        const resolvedManagerId = inviter.role === 'MANAGER' && role === 'EMPLOYEE' ? inviter.id : null

        // 4. Create the dedicated invite record
        const { error: insertError } = await supabaseAdmin.from('invites').insert({
            email,
            name,
            role: role.toUpperCase(),
            token,
            expires_at,
            invited_by: inviter.id,
            manager_id: resolvedManagerId,
            status: 'pending'
        })

        if (insertError) {
            if (insertError.code === '23505') {
                return NextResponse.json({ error: 'This email has already been invited or exists' }, { status: 400 })
            }
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        // 5. Send Email
        const host = req.headers.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const registrationLink = `${protocol}://${host}/register?token=${token}`

        await sendEmail({
            to: email,
            subject: 'You are invited to join Spartans',
            html: `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
                    <h2 style="color: #4F46E5;">Welcome to Spartans!</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>You have been invited to join the Spartans platform as a <strong>${role}</strong>.</p>
                    <p>Please click the button below to register and activate your account. This link expires in 24 hours.</p>
                    <div style="margin: 30px 0;">
                        <a href="${registrationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Activate Account
                        </a>
                    </div>
                    <p>Or copy this link into your browser:</p>
                    <p style="word-break: break-all; color: #666; font-size: 12px; background: #f9f9f9; padding: 10px; border-radius: 4px;">${registrationLink}</p>
                </div>
            `
        })

        return NextResponse.json({
            success: true,
            message: 'Invitation sent successfully'
        }, { status: 201 })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
