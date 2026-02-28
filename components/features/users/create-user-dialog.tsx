'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const { currentUser } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const availableRoles =
    currentUser?.role === 'SUPERADMIN'
      ? [
        { value: 'MANAGER', label: 'Manager' },
        { value: 'EMPLOYEE', label: 'Employee' },
      ]
      : [{ value: 'EMPLOYEE', label: 'Employee' }]

  const handleReset = () => {
    setName('')
    setEmail('')
    setRole('')
    setSent(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !role) return

    setLoading(true)
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          role,
          companyId: currentUser?.companyId || 'company-1',
          createdBy: currentUser?.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to send invite')
        return
      }

      setSent(true)
      toast.success(`Invite sent to ${email}`)
      onSuccess?.()
    } catch (err) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a User</DialogTitle>
          <DialogDescription>
            An email will be sent with a link for them to set their password and access the platform.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <p className="font-semibold text-foreground">Invite Sent!</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{email}</span> will receive an email
                to set up their account.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                Invite Another
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full Name</Label>
              <Input
                id="invite-name"
                placeholder="e.g. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select role" />
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

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !role}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
