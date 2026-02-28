'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, Eye, EyeOff, RefreshCw, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    emailPrefix: '',
    department: '',
    role: 'employee',
    password: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null)

  const corporateDomain = '@spartans.com'

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData({ ...formData, password })
  }

  const handleCreate = () => {
    if (!formData.emailPrefix || !formData.password || !formData.name) {
      toast.error('Please fill in all required fields')
      return
    }

    const fullEmail = `${formData.emailPrefix.toLowerCase()}${corporateDomain}`

    // Simulate creation
    setCreatedCredentials({
      email: fullEmail,
      password: formData.password,
    })
    toast.success('User created successfully')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const resetAndClose = () => {
    setCreatedCredentials(null)
    setFormData({
      name: '',
      emailPrefix: '',
      department: '',
      role: 'employee',
      password: '',
      phone: '',
    })
    onOpenChange(false)
  }

  const handleSendEmail = () => {
    if (!createdCredentials) return

    const subject = encodeURIComponent('Welcome to Spartans Platform - Your Account Credentials')
    const body = encodeURIComponent(
      `Hello,\n\nYour account has been created on the Spartans Platform.\n\n` +
      `Login URL: ${window.location.origin}\n` +
      `Email Address: ${createdCredentials.email}\n` +
      `Temporary Password: ${createdCredentials.password}\n\n` +
      `Please log in and change your password immediately for security.\n\n` +
      `Best regards,\n` +
      `Management Team`
    )

    window.open(`mailto:${createdCredentials.email}?subject=${subject}&body=${body}`, '_blank')
    toast.success('Email client opened')
  }

  if (createdCredentials) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Credentials Created</DialogTitle>
            <DialogDescription>
              Share these credentials with the employee so they can access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center gap-2">
                <Input value={createdCredentials.email} readOnly className="bg-muted" />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(createdCredentials.email, 'Email')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex items-center gap-2">
                <Input value={createdCredentials.password} readOnly className="bg-muted" />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(createdCredentials.password, 'Password')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-3">
            <Button variant="outline" className="flex-1" onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send via Email
            </Button>
            <Button className="flex-1" onClick={resetAndClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user and set their login credentials.</DialogDescription>
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
              <div className="flex items-center">
                <Input
                  id="email"
                  placeholder="username"
                  className="rounded-r-none"
                  value={formData.emailPrefix}
                  onChange={(e) => {
                    const value = e.target.value.split('@')[0].trim()
                    setFormData({ ...formData, emailPrefix: value })
                  }}
                />
                <div className="flex h-10 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground whitespace-nowrap">
                  {corporateDomain}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Login Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set initial password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={generatePassword} title="Generate Password">
                <RefreshCw className="h-4 w-4" />
              </Button>
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
              <Select defaultValue="employee" onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">SuperAdmin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
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
            <Button className="flex-1" onClick={handleCreate}>Create User & Credentials</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
