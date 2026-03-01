'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface ManageAssetDialogProps {
    asset: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function ManageAssetDialog({ asset, open, onOpenChange, onSuccess }: ManageAssetDialogProps) {
    const { currentUser } = useAppStore()
    const [status, setStatus] = useState<string>('')
    const [assignedUser, setAssignedUser] = useState<string>('')
    const [users, setUsers] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (asset) {
            setStatus(asset.status)
            setAssignedUser(asset.current_user_id || 'none')
        }
    }, [asset])

    useEffect(() => {
        async function fetchUsers() {
            if (!currentUser?.companyId) return
            const supabase = createClient()
            const { data } = await supabase
                .from('users')
                .select('id, name')
                .eq('company_id', currentUser.companyId)
            if (data) setUsers(data)
        }
        fetchUsers()
    }, [currentUser?.companyId])

    const handleUpdate = async () => {
        if (!asset) return
        setIsSubmitting(true)
        const supabase = createClient()
        const { error } = await supabase
            .from('assets')
            .update({
                status,
                current_user_id: assignedUser === 'none' ? null : assignedUser
            })
            .eq('id', asset.id)

        setIsSubmitting(false)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success('Asset updated successfully')
        onSuccess()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Asset: {asset?.name}</DialogTitle>
                    <DialogDescription>Update the inventory status or assigned user.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Asset Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVAILABLE">Available</SelectItem>
                                <SelectItem value="IN_USE">In Use</SelectItem>
                                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                <SelectItem value="RETIRED">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(status === 'IN_USE' || status === 'AVAILABLE' || assignedUser !== 'none') && (
                        <div>
                            <Label>Assigned User</Label>
                            <Select value={assignedUser} onValueChange={setAssignedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleUpdate} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
