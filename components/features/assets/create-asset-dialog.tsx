'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'

interface CreateAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function CreateAssetDialog({ open, onOpenChange, onSuccess }: CreateAssetDialogProps) {
  const { currentUser } = useAppStore()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serialNumber: '',
    value: '',
    purchaseDate: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error('Asset Name and Type are required.')
      return
    }

    if (!currentUser?.companyId) return

    setIsSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase.from('assets').insert({
      company_id: currentUser.companyId,
      name: formData.name,
      type: formData.type,
      serial_number: formData.serialNumber,
      value: formData.value ? parseFloat(formData.value) : null,
      purchase_date: formData.purchaseDate || null,
      description: formData.description,
      status: 'AVAILABLE'
    })

    setIsSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Asset created successfully')

    // reset form
    setFormData({
      name: '',
      type: '',
      serialNumber: '',
      value: '',
      purchaseDate: '',
      description: ''
    })

    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>Register a new asset to your company inventory</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Asset Name</Label>
            <Input
              placeholder="Enter asset name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Asset Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hardware">Hardware</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Serial Number</Label>
            <Input
              placeholder="Enter serial number"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            />
          </div>

          <div>
            <Label>Asset Value</Label>
            <Input
              type="number"
              placeholder="Enter asset value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>

          <div>
            <Label>Purchase Date</Label>
            <Input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Additional details"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Asset'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
