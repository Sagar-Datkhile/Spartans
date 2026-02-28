import { UserRole } from '@/lib/store'
import { Feature } from '@/lib/rbac'

export interface AuthContext {
  userId: string
  role: UserRole
  companyId: string
}

export interface RouteProtection {
  requiredRole?: UserRole[]
  requiredFeature?: Feature
}

export function checkRouteAccess(
  userRole: UserRole,
  protection: RouteProtection
): boolean {
  if (!protection.requiredRole && !protection.requiredFeature) {
    return true
  }

  if (protection.requiredRole && !protection.requiredRole.includes(userRole)) {
    return false
  }

  // Feature check would happen in component via RoleGuard
  return true
}

export function getRoleHierarchy(): Record<UserRole, number> {
  return {
    SUPERADMIN: 3,
    MANAGER: 2,
    EMPLOYEE: 1,
  }
}

export function canPerformAction(
  userRole: UserRole,
  actionRequiredRole: UserRole
): boolean {
  const hierarchy = getRoleHierarchy()
  return hierarchy[userRole] >= hierarchy[actionRequiredRole]
}

export function getAccessibleResources(userRole: UserRole, userId: string) {
  switch (userRole) {
    case 'SUPERADMIN':
      return { scope: 'ALL', userId }
    case 'MANAGER':
      return { scope: 'DEPARTMENT', userId }
    case 'EMPLOYEE':
      return { scope: 'PERSONAL', userId }
    default:
      return { scope: 'NONE', userId }
  }
}
