import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
    try {
        const { name, email, companyName, password } = await req.json()

        if (!name || !email || !companyName || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        })

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 })
        }

        // Create Company
        const { data: companyData, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({ name: companyName, status: 'active' })
            .select()
            .single()

        if (companyError || !companyData) {
            // rollback user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: companyError?.message || 'Failed to create company' }, { status: 400 })
        }

        // Create User Profile
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                company_id: companyData.id,
                company_name: companyName,
                role: 'SUPERADMIN',
                status: 'active'
            })

        if (userError) {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: userError.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, user: authData.user })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
