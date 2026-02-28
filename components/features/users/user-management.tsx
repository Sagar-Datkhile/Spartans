'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Upload, Mail, Loader2, UserPlus } from 'lucide-react'
import CreateUserDialog from './create-user-dialog'
import BulkInviteDialog from './bulk-invite-dialog'
import { useAppStore } from '@/lib/store'
import { useFirestoreListener } from '@/lib/hooks/useFirestoreListener'
import { where } from 'firebase/firestore'
import { UserProfile } from '@/lib/models'

const getRoleColor = (role: string) => {
  switch (role) {
    case 'SUPERADMIN': return 'bg-red-500 text-white'
    case 'MANAGER': return 'bg-blue-500 text-white'
    case 'EMPLOYEE': return 'bg-green-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

const getStatusStyle = (status: string) => {
  return status === 'active'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : status === 'pending'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export default function UserManagement() {
  const { currentUser } = useAppStore()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)

  // Live Firestore data filtered by company
  const { data: users, loading } = useFirestoreListener<UserProfile>('users', [
    where('companyId', '==', currentUser?.companyId || 'company-1'),
  ])

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{loading ? '...' : users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import CSV
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Users className="h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">No users yet</p>
          <p className="text-sm text-muted-foreground/70">
            Invite your first team member to get started.
          </p>
          <Button size="sm" className="mt-2" onClick={() => setInviteOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send First Invite
          </Button>
        </div>
      )}

      {/* User list */}
      {!loading && users.map((user) => (
        <Card key={user.id}>
          <CardContent className="pt-5 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className={getRoleColor(user.role)}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              <Badge variant="secondary" className={getStatusStyle(user.status)}>
                {user.status === 'pending' ? '⏳ Pending' : user.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Dialogs */}
      <CreateUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={() => setInviteOpen(false)}
      />
      <BulkInviteDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onSuccess={() => setBulkOpen(false)}
      />
    </div>
  )
}
