'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CreateAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateAssetDialog({ open, onOpenChange }: CreateAssetDialogProps) {
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
            <Input placeholder="Enter asset name" />
          </div>

          <div>
            <Label>Asset Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Serial Number</Label>
            <Input placeholder="Enter serial number" />
          </div>

          <div>
            <Label>Asset Value</Label>
            <Input type="number" placeholder="Enter asset value" />
          </div>

          <div>
            <Label>Purchase Date</Label>
            <Input type="date" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea placeholder="Additional details" rows={2} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Add Asset</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
