'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, Eye, EyeOff, RefreshCw, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const { currentUser } = useAppStore()

  // Memoize available roles so they only change when the current user's role changes
  const availableRoles = useMemo(() => {
    if (currentUser?.role === 'SUPERADMIN') {
      return [{ value: 'MANAGER', label: 'Manager' }]
    }
    if (currentUser?.role === 'MANAGER') {
      return [{ value: 'EMPLOYEE', label: 'Employee' }]
    }
    return []
  }, [currentUser?.role])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    password: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null)

  // Update role if availableRoles changes and the current role is no longer valid
  useEffect(() => {
    if (availableRoles.length > 0 && formData.role !== availableRoles[0].value) {
      setFormData(prev => ({ ...prev, role: availableRoles[0].value }))
    }
  }, [availableRoles, formData.role])

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData({ ...formData, password })
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: session } = await createClient().auth.getSession()
      const token = session.session?.access_token || ''

      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          name: formData.name,
          role: formData.role
        })
      });

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send invite')

      toast.success('Invitation sent securely via Email')
      onSuccess?.()
      onOpenChange(false)

      // Reset form
      setFormData({
        name: '',
        email: '',
        department: '',
        role: availableRoles[0]?.value || 'EMPLOYEE',
        password: '',
        phone: '',
      })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Platform Invitation</DialogTitle>
          <DialogDescription>Add a new user and automatically email them a secure registration link.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, department: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eng">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
                disabled={availableRoles.length <= 1}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {availableRoles.find(r => r.value === formData.role)?.label || 'Select role'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User & Credentials'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
