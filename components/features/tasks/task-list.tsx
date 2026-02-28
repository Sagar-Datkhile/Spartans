'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Calendar, User } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { EmployeeTaskModal } from './employee-task-modal'
const mockTasks = [
  {
    id: '1',
    title: 'Design homepage mockup',
    project: 'Website Redesign',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee: 'John Doe',
    dueDate: '2026-03-15',
    completed: false,
  },
  {
    id: '2',
    title: 'Setup database schema',
    project: 'Mobile App',
    status: 'TODO',
    priority: 'HIGH',
    assignee: 'Jane Smith',
    dueDate: '2026-03-10',
    completed: false,
  },
  {
    id: '3',
    title: 'API documentation',
    project: 'API Integration',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    assignee: 'Bob Wilson',
    dueDate: '2026-03-05',
    completed: true,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'TODO':
      return 'text-slate-600 bg-slate-100'
    case 'IN_PROGRESS':
      return 'text-blue-600 bg-blue-100'
    case 'IN_REVIEW':
      return 'text-amber-600 bg-amber-100'
    case 'COMPLETED':
      return 'text-emerald-600 bg-emerald-100'
    default:
      return 'text-slate-600 bg-slate-100'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW':
      return 'text-emerald-700 bg-emerald-50 border-emerald-100'
    case 'MEDIUM':
      return 'text-amber-700 bg-amber-50 border-amber-100'
    case 'HIGH':
      return 'text-rose-700 bg-rose-50 border-rose-100'
    default:
      return 'text-slate-700 bg-slate-50 border-slate-100'
  }
}

export default function TaskList() {
  const currentUser = useAppStore((state) => state.currentUser)
  const [selectedTask, setSelectedTask] = useState<(typeof mockTasks)[0] | null>(null)

  return (
    <div className="grid gap-4">
      {mockTasks.map((task) => (
        <Card key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 transition-all hover:border-gray-400 hover:shadow-md">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Checkbox
              defaultChecked={task.completed}
              className="h-5 w-5 rounded-md"
            />
            <div className="sm:hidden flex items-center gap-2">
              <Badge variant="secondary" className={`${getStatusColor(task.status)} border-none shadow-none`}>
                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center gap-y-1 lg:gap-3">
              <h3 className={`font-semibold text-lg truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="secondary" className={`${getStatusColor(task.status)} text-[11px] font-semibold px-2 py-0.5 border-none shadow-none`}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-[10px] font-bold uppercase tracking-wider`}>
                  {task.priority}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                <span className="font-medium text-primary">Project:</span> {task.project}
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary/70" />
                <span>{task.dueDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary/70" />
                <span>{task.assignee}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentUser?.role !== 'EMPLOYEE' && (
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Details
              </Button>
            )}
            <Button size="sm" className="w-full sm:w-auto" onClick={() => setSelectedTask(task)}>
              View
            </Button>
          </div>
        </Card>
      ))}

      {currentUser?.role === 'EMPLOYEE' ? (
        <EmployeeTaskModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      ) : (
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTask?.title}</DialogTitle>
              <DialogDescription>Task Details</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Project:</span>
                    <span className="text-sm">{selectedTask.project}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Assignee:</span>
                    <span className="text-sm">{selectedTask.assignee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Due Date:</span>
                    <span className="text-sm">{selectedTask.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Status:</span>
                    <Badge variant="secondary" className={`${getStatusColor(selectedTask.status)} text-[11px] font-semibold px-2 py-0.5 border-none shadow-none`}>
                      {selectedTask.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Priority:</span>
                    <Badge variant="outline" className={`${getPriorityColor(selectedTask.priority)} text-[10px] font-bold uppercase tracking-wider`}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Manager Notes:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    Please ensure to follow the brand guidelines while working on this task. Reach out if you need any resources or have questions.
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
