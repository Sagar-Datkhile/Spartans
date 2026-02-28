'use client'

import { useEffect, useState } from 'react'
import { useAppStore, useUIStore } from '@/lib/store'
import { getRoleNavigationItems } from '@/lib/rbac'
import Header from '@/components/dashboard/header'
import Sidebar from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser } = useAppStore()
  const { setNavigationItems } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initialize with mock user data for development
    if (!currentUser) {
      const mockUser = {
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'SUPERADMIN' as const,
        companyId: 'company-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      useAppStore.setState({ currentUser: mockUser })
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      const navItems = getRoleNavigationItems(currentUser.role)
      setNavigationItems(navItems as any)
    }
  }, [currentUser, setNavigationItems])

  if (!mounted || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
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
