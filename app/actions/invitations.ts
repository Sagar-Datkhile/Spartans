'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function inviteUser(email: string, role: 'MANAGER' | 'EMPLOYEE', companyId?: string, departmentId?: string) {
    const supabase = await createClient()

    // 1. Authenticate caller and get their role
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
        throw new Error('Unauthorized')
    }

    // Fetch the caller's true role from the users table 
    const { data: callerProfile, error: profileError } = await supabase
        .from('users')
        .select('role, company_id, department_id')
        .eq('id', session.user.id)
        .single()

    if (profileError || !callerProfile) {
        throw new Error('Unauthorized to perform this action')
    }

    // 2. Enforce Role Hierarchy
    if (role === 'MANAGER' && callerProfile.role !== 'SUPERADMIN') {
        throw new Error('Only a SUPERADMIN can invite a MANAGER')
    }
    if (role === 'EMPLOYEE' && !['SUPERADMIN', 'MANAGER'].includes(callerProfile.role)) {
        throw new Error('Only Managers and Admins can invite Employees')
    }

    // 3. Send the invite via Supabase Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

    if (inviteError) {
        console.error('Error sending invite:', inviteError)
        throw new Error(inviteError.message || 'Failed to send invite')
    }

    const newUserId = inviteData.user.id

    // 4. Create the corresponding profile in the public.users table
    const { error: insertError } = await supabaseAdmin.from('users').upsert({
        id: newUserId,
        email: email,
        name: email.split('@')[0], // placeholder name
        role: role,
        company_id: companyId || callerProfile.company_id,
        department_id: departmentId || callerProfile.department_id,
        password_changed: false // Force the onboarding flow
    })

    if (insertError) {
        console.error('Error creating user profile:', insertError)
        // Ideally we'd rollback the auth user creation here, or leave it orphaned and run a cleanup chron job.
        // For simplicity, we just throw.
        throw new Error('User invited, but profile creation failed.')
    }

    revalidatePath('/dashboard/users') // Assuming a users management page exists
    return { success: true }
}
