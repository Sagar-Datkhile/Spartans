'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new project to manage with your team</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Project Name</Label>
            <Input placeholder="Enter project name" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea placeholder="Describe your project" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>

          <div>
            <Label>Budget</Label>
            <Input type="number" placeholder="Enter budget" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Create Project</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
