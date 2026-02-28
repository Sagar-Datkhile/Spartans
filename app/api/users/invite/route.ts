import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, role, companyId, departmentId, phone, createdBy, managerId } = await req.json()

        if (!email || !name || !role || !companyId || !password) {
            return NextResponse.json({ error: 'Email, password, name, role, and companyId are required' }, { status: 400 })
        }

        // Create User in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        })

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 400 })
        }

        // Create User Profile in public.users
        const { error: profileError } = await supabaseAdmin.from('users').insert({
            id: authData.user.id,
            email,
            name,
            role,
            company_id: companyId,
            department_id: departmentId || null,
            phone: phone || null,
            status: 'active',
            created_by: createdBy || null,
            manager_id: managerId || null
        })

        if (profileError) {
            // Rollback auth user creation if profile fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: profileError.message }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            userId: authData.user.id,
            message: `User created successfully`,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 })
    }
}
