import { UserRole } from './store'

export type Feature =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'gantt'
  | 'assets'
  | 'analytics'
  | 'chat'
  | 'user_management'
  | 'settings'
  | 'csv_upload'

const rolePermissions: Record<UserRole, Feature[]> = {
  SUPERADMIN: [
    'dashboard',
    'projects',
    'tasks',
    'assets',
    'analytics',
    'chat',
    'user_management',
    'settings',
    'csv_upload',
  ],
  MANAGER: [
    'dashboard',
    'projects',
    'tasks',
    'gantt',
    'assets',
    'analytics',
    'chat',
    'csv_upload',
  ],
  EMPLOYEE: [
    'dashboard',
    'tasks',
    'chat',
    'analytics',
    'gantt',
  ],
}

export const canAccess = (role: UserRole, feature: Feature): boolean => {
  return rolePermissions[role]?.includes(feature) ?? false
}

export const getVisibleFeatures = (role: UserRole): Feature[] => {
  return rolePermissions[role] ?? []
}

export const getDashboardLayout = (role: UserRole): string => {
  switch (role) {
    case 'SUPERADMIN':
      return 'admin-dashboard'
    case 'MANAGER':
      return 'manager-dashboard'
    case 'EMPLOYEE':
      return 'employee-dashboard'
    default:
      return 'employee-dashboard'
  }
}

export const getRoleNavigationItems = (role: UserRole) => {
  const baseItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      href: '/dashboard',
      visible: ['SUPERADMIN', 'MANAGER', 'EMPLOYEE'] as UserRole[],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'FolderOpen',
      href: '/dashboard/projects',
      visible: ['SUPERADMIN', 'MANAGER'] as UserRole[],
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'CheckSquare',
      href: '/dashboard/tasks',
      visible: ['SUPERADMIN', 'MANAGER', 'EMPLOYEE'] as UserRole[],
    },
    {
      id: 'gantt',
      label: 'Gantt Chart',
      icon: 'BarChart3',
      href: '/dashboard/gantt',
      visible: ['MANAGER', 'EMPLOYEE'] as UserRole[],
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: 'Package',
      href: '/dashboard/assets',
      visible: ['SUPERADMIN', 'MANAGER'] as UserRole[],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'TrendingUp',
      href: '/dashboard/analytics',
      visible: ['SUPERADMIN', 'MANAGER', 'EMPLOYEE'] as UserRole[],
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: 'MessageSquare',
      href: '/dashboard/chat',
      visible: ['SUPERADMIN', 'MANAGER', 'EMPLOYEE'] as UserRole[],
    },
    {
      id: 'user_management',
      label: 'User Management',
      icon: 'Users',
      href: '/dashboard/users',
      visible: ['SUPERADMIN', 'MANAGER'] as UserRole[],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      href: '/dashboard/settings',
      visible: ['SUPERADMIN'] as UserRole[],
    },
  ]

  return baseItems.filter((item) => item.visible.includes(role))
}
