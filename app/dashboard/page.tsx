'use client'

import { useAppStore } from '@/lib/store'
import { getDashboardLayout } from '@/lib/rbac'
import AdminDashboard from '@/components/dashboard/admin-dashboard'
import ManagerDashboard from '@/components/dashboard/manager-dashboard'
import EmployeeDashboard from '@/components/dashboard/employee-dashboard'

export default function DashboardPage() {
  const { currentUser } = useAppStore()

  if (!currentUser) {
    return <div>Loading...</div>
  }

  const dashboardLayout = getDashboardLayout(currentUser.role)

  return (
    <div className="p-6">
      {dashboardLayout === 'admin-dashboard' && <AdminDashboard />}
      {dashboardLayout === 'manager-dashboard' && <ManagerDashboard />}
      {dashboardLayout === 'employee-dashboard' && <EmployeeDashboard />}
    </div>
  )
}
