'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const availablePermissions = [
  'dashboard',
  'projects',
  'tasks',
  'gantt',
  'assets',
  'analytics',
  'chat',
  'user_management',
  'settings',
  'csv_upload',
]

export default function RoleManagement() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const handleEditRole = (role: string) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Manage roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['SUPERADMIN', 'MANAGER', 'EMPLOYEE'].map((role) => (
              <div key={role} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{role}</h3>
                    <Badge variant="outline">
                      {role === 'SUPERADMIN' ? '9' : role === 'MANAGER' ? '8' : '5'} permissions
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                    Edit Permissions
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availablePermissions
                    .filter(perm => {
                      if (role === 'SUPERADMIN') return perm !== 'gantt'
                      if (role === 'MANAGER') return perm !== 'user_management' && perm !== 'settings'
                      if (role === 'EMPLOYEE') return ['dashboard', 'tasks', 'chat', 'analytics', 'gantt'].includes(perm)
                      return false
                    })
                    .map((perm) => (
                      <div key={perm} className="text-xs bg-muted px-2 py-1 rounded">
                        {perm}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedRole} Permissions</DialogTitle>
            <DialogDescription>Manage what features this role can access</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availablePermissions.map((permission) => (
                <label key={permission} className="flex items-center gap-3">
                  <Checkbox defaultChecked />
                  <span className="text-sm">{permission.replace('_', ' ')}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
