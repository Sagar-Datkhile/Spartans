'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUser } from '@/lib/services/firestore'
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Not logged in — redirect to login
        router.replace('/login')
        return
      }

      // If Zustand already has this user loaded, skip
      if (currentUser?.id === firebaseUser.uid) return

      // Load profile from Firestore
      const profile = await getUser(firebaseUser.uid)
      if (!profile) {
        await auth.signOut()
        router.replace('/login')
        return
      }

      const user = {
        id: firebaseUser.uid,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar,
        companyId: profile.companyId,
        departmentId: profile.departmentId,
        createdAt: profile.createdAt.toDate(),
        updatedAt: profile.updatedAt.toDate(),
      }
      setCurrentUser(user)
      setNavigationItems(getRoleNavigationItems(profile.role) as any)
    })

    return () => unsubscribe()
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
