'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore, useUIStore } from '@/lib/store'
import { getRoleNavigationItems } from '@/lib/rbac'
import Header from '@/components/dashboard/header'
import Sidebar from '@/components/dashboard/sidebar'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { currentUser, setCurrentUser } = useAppStore()
  const { setNavigationItems } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentStoreUser = useAppStore.getState().currentUser

      if (!session?.user) {
        // Allow demo users to bypass
        if (currentStoreUser?.id?.startsWith('demo-') || currentStoreUser?.id?.startsWith('dev-')) {
          setNavigationItems(getRoleNavigationItems(currentStoreUser.role) as any)
          return
        }
        router.replace('/login')
        return
      }

      // If already correctly loaded, skip
      if (currentStoreUser?.id === session.user.id) return

      // Load profile to get role via server-side API to bypass RLS limits
      const profileRes = await fetch('/api/users/me')
      if (!profileRes.ok) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      const { profile } = await profileRes.json()

      const path = window.location.pathname
      if (path.startsWith('/dashboard/superadmin') && profile.role !== 'SUPERADMIN') {
        router.replace('/unauthorized')
        return
      } else if (path.startsWith('/dashboard/manager') && profile.role !== 'MANAGER') {
        router.replace('/unauthorized')
        return
      } else if (path.startsWith('/dashboard/employee') && profile.role !== 'EMPLOYEE') {
        router.replace('/unauthorized')
        return
      }

      const user = {
        id: session.user.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar_url,
        companyId: profile.company_id,
        departmentId: profile.department_id,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      }
      setCurrentUser(user)
      setNavigationItems(getRoleNavigationItems(profile.role) as any)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentUser) {
      setNavigationItems(getRoleNavigationItems(currentUser.role) as any)
    }
  }, [currentUser, setNavigationItems])

  if (!mounted || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
