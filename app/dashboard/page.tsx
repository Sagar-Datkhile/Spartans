'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { currentUser } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'SUPERADMIN') {
        router.replace('/dashboard/superadmin')
      } else if (currentUser.role === 'MANAGER') {
        router.replace('/dashboard/manager')
      } else {
        router.replace('/dashboard/employee')
      }
    }
  }, [currentUser, router])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
