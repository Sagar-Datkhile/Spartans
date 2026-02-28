import { create } from 'zustand'

export type UserRole = 'SUPERADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  companyId?: string
  departmentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface AppState {
  currentUser: User | null
  isLoading: boolean
  setCurrentUser: (user: User | null) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  isLoading: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))

export interface NavigationItem {
  id: string
  label: string
  icon: string
  href: string
  visible: UserRole[]
  children?: NavigationItem[]
}

export interface UIState {
  sidebarOpen: boolean
  navigationItems: NavigationItem[]
  setSidebarOpen: (open: boolean) => void
  setNavigationItems: (items: NavigationItem[]) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  navigationItems: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNavigationItems: (items) => set({ navigationItems: items }),
}))
