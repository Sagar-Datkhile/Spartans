'use client'

import { Menu, Settings, LogOut, User } from 'lucide-react'
import { useAppStore, useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import SetStatusDialog from '@/components/features/users/set-status-dialog'
import ProfileDialog from '@/components/features/users/profile-dialog'
import { useState } from 'react'

export default function Header() {
  const { currentUser } = useAppStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    useAppStore.setState({ currentUser: null })
    router.replace('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-black'
      case 'MANAGER':
        return 'bg-blue-500'
      case 'EMPLOYEE':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">


        <div className="hidden items-center gap-2 sm:flex">
          {currentUser?.role !== 'SUPERADMIN' && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${getRoleColor(currentUser?.role || '')}`}>
              {currentUser?.role}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback className={`${getRoleColor(currentUser?.role || '')} text-white`}>
                  {getInitials(currentUser?.name || 'User')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col gap-2 p-2">
              <p className="text-sm font-semibold">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
            </div>
            <DropdownMenuSeparator />
            {currentUser?.role !== 'SUPERADMIN' && (
              <DropdownMenuItem onSelect={() => setStatusDialogOpen(true)}>
                <div className="flex items-center w-full">
                  <span className="mr-3 text-lg leading-none">{currentUser?.status?.emoji || '😊'}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{currentUser?.status?.text || 'Set Status'}</span>
                    {currentUser?.status?.duration && (
                      <span className="text-xs text-muted-foreground/80">{currentUser?.status?.duration}</span>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onSelect={(e) => {
              e.preventDefault();
              handleLogout();
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SetStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </header>
  )
}
