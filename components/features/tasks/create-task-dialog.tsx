'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { employees } = useAppStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to track progress</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Task Title</Label>
            <Input placeholder="Enter task title" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea placeholder="Describe the task" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website Redesign</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="api">API Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assign To</Label>
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.role === 'EMPLOYEE').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <span>{emp.name}</span>
                        {emp.status && (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <span className="flex items-center justify-center p-0.5" tabIndex={-1}>
                                  <Info className="h-4 w-4 text-muted-foreground/70 transition-colors" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl leading-none">{emp.status.emoji}</span>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{emp.status.text}</span>
                                    {emp.status.duration && (
                                      <span className="text-xs text-muted-foreground">{emp.status.duration}</span>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Create Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
