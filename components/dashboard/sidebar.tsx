'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUIStore, useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { navigationItems, sidebarOpen } = useUIStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    useAppStore.setState({ currentUser: null })
    router.replace('/login')
  }

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      LayoutDashboard: Icons.LayoutDashboard,
      FolderOpen: Icons.FolderOpen,
      CheckSquare: Icons.CheckSquare,
      BarChart3: Icons.BarChart3,
      Package: Icons.Package,
      TrendingUp: Icons.TrendingUp,
      MessageSquare: Icons.MessageSquare,
      Users: Icons.Users,
      Settings: Icons.Settings,
    }
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => useUIStore.setState({ sidebarOpen: false })}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
              D
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">Dashboard</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navigationItems.map((item: any) => {
            // Check if active:
            // If the item is the main "Dashboard" link, it should be active if we are exactly on /dashboard or its role-specific sub-routes (but NOT things like /dashboard/tasks).
            // For everything else, if the current URL starts with the item's href, it is active (e.g. /dashboard/tasks/123 -> matches /dashboard/tasks).
            const isDashboardBase = item.href === '/dashboard'
            const isActive = isDashboardBase
              ? pathname === '/dashboard' || pathname === '/dashboard/superadmin' || pathname === '/dashboard/manager' || pathname === '/dashboard/employee'
              : pathname.startsWith(item.href)

            const Icon = getIcon(item.icon)

            return (
              <Link key={item.id} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex-shrink-0 flex items-center justify-center">
                    {Icon}
                  </div>
                  <span className="truncate flex-1">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
          <div className="rounded-lg bg-sidebar-accent p-4">
            <p className="text-xs font-semibold text-sidebar-foreground">Need Help?</p>
            <p className="mt-1 text-xs text-sidebar-foreground/70">
              Check our documentation for guides and support.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-sidebar-accent transition-colors"
          >
            <Icons.LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
