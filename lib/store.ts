import { create } from 'zustand'

export type UserRole = 'SUPERADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface EmployeeStatus {
  emoji: string
  text: string
  duration?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  companyId?: string
  departmentId?: string
  status?: EmployeeStatus | null
  createdAt: Date
  updatedAt: Date
}

export const initialEmployees: User[] = [
  { id: 'emp1', name: 'Spartans@code', email: 'spartans@code.com', role: 'EMPLOYEE', createdAt: new Date(), updatedAt: new Date(), status: { emoji: '🏡', text: 'Working remotely', duration: 'Today' } },
  { id: 'john', name: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE', createdAt: new Date(), updatedAt: new Date(), status: { emoji: '🗓️', text: 'In a meeting', duration: '1 hour' } },
  { id: 'jane', name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE', createdAt: new Date(), updatedAt: new Date(), status: { emoji: '🤒', text: 'Out sick', duration: 'Today' } },
  { id: 'bob', name: 'Bob Wilson', email: 'bob@example.com', role: 'EMPLOYEE', createdAt: new Date(), updatedAt: new Date() },
]

export interface AppState {
  currentUser: User | null
  isLoading: boolean
  employees: User[]
  setCurrentUser: (user: User | null) => void
  setIsLoading: (isLoading: boolean) => void
  updateEmployeeStatus: (userId: string, status: EmployeeStatus | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: { ...initialEmployees[0], role: 'EMPLOYEE' }, // Default to Employee Spartans@code
  isLoading: false,
  employees: initialEmployees,
  setCurrentUser: (user) => set({ currentUser: user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateEmployeeStatus: (userId, status) => set((state) => {
    const updatedEmployees = state.employees.map(emp =>
      emp.id === userId ? { ...emp, status } : emp
    )
    return {
      employees: updatedEmployees,
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, status } : state.currentUser
    }
  }),
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
