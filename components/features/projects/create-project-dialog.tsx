'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, DollarSign, FileText, FolderPlus } from 'lucide-react'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header styling */}
        <div className="bg-muted/30 px-6 py-4 border-b">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FolderPlus className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Create New Project</DialogTitle>
            </div>
            <DialogDescription>
              Add a new project to manage with your team. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">Project Name</Label>
            <div className="relative">
              <Input id="project-name" placeholder="E.g., Website Redesign Q3" className="pl-9" />
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="project-desc"
              placeholder="What are the goals and objectives?"
              className="resize-none min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
              <div className="relative">
                <Input id="start-date" type="date" className="pl-9 [&::-webkit-calendar-picker-indicator]:opacity-0" />
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
              <div className="relative">
                <Input id="end-date" type="date" className="pl-9 [&::-webkit-calendar-picker-indicator]:opacity-0" />
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium">Budget</Label>
            <div className="relative">
              <Input id="budget" type="number" placeholder="5000" className="pl-9" />
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Estimated total cost for this project.</p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
