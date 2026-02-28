'use client'

import { ReactNode } from 'react'
import { useAppStore } from '@/lib/store'
import { canAccess, Feature } from '@/lib/rbac'

interface RoleGuardProps {
  requiredFeature: Feature
  children: ReactNode
  fallback?: ReactNode
}

export default function RoleGuard({
  requiredFeature,
  children,
  fallback,
}: RoleGuardProps) {
  const { currentUser } = useAppStore()

  if (!currentUser) {
    return fallback || <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  const hasAccess = canAccess(currentUser.role, requiredFeature)

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access this feature.
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}
