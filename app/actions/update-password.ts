'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateInitialPassword(password: string) {
    const supabase = await createClient()

    // Caller must be logged in (they clicked the magic link)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
        throw new Error('Unauthorized')
    }

    // Update their core authentication password
    const { error: authError } = await supabase.auth.updateUser({
        password: password
    })

    if (authError) {
        console.error('Failed to set password:', authError)
        throw new Error(authError.message || 'Failed to update password')
    }

    // Mark the profile as fully onboarded so the RoleGuard stops redirecting them
    const { error: profileError } = await supabase
        .from('users')
        .update({ password_changed: true })
        .eq('id', session.user.id)

    if (profileError) {
        console.error('Error updating password_changed flag:', profileError)
        // User is still authenticated but we failed to clear the flag. 
        // We throw so the UI can prompt them to try submitting again or contact support.
        throw new Error('Password was set, but profile synchronization failed.')
    }

    revalidatePath('/')
    return { success: true }
}
