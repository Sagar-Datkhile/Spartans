'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import { EmployeeTaskModal } from './employee-task-modal'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'


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

export default function TaskList({ refreshKey }: { refreshKey?: number }) {
  const currentUser = useAppStore((state) => state.currentUser)
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchTasks() {
      if (!currentUser?.companyId) return
      setLoading(true)

      let query = supabase
        .from('tasks')
        .select(`
          *,
          projects!inner ( id, name, company_id ),
          users!tasks_assigned_to_fkey ( id, name )
        `)
        .eq('projects.company_id', currentUser.companyId)
        .order('created_at', { ascending: false })

      if (currentUser.role === 'EMPLOYEE') {
        query = query.eq('assigned_to', currentUser.id)
      }

      const { data, error } = await query

      if (!error && data) {
        // Map data to expected format for rendering
        const mappedTasks = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          project: t.projects?.name || 'Unknown',
          description: t.description,
          status: t.status,
          priority: t.priority,
          assignee: t.users?.name || 'Unassigned',
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No Date',
          completed: t.status === 'COMPLETED'
        }))
        setTasks(mappedTasks)
      }
      setLoading(false)
    }

    fetchTasks()
  }, [currentUser, refreshKey])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-card/50 border-dashed">
        <h3 className="text-lg font-medium text-foreground mb-1">No tasks yet</h3>
        <p className="text-muted-foreground text-sm">Create a task to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 transition-all hover:border-gray-400 hover:shadow-md">
          <div className="flex items-center gap-4 w-full sm:w-auto">
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
          onTaskUpdated={() => {
            // We can trigger a reload by forcing state change, but simpler is fetchTasks manually
            // Since we extracted fetchTasks, we can just reload the page or add a re-fetch method.
            // But for now, window.location.reload() works fine as requested.
            window.location.reload()
          }}
        />
      ) : (
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="p-6 pb-4 border-b shrink-0">
              <DialogTitle className="text-xl">{selectedTask?.title}</DialogTitle>
              <DialogDescription>Task Details Overview</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                <div className="space-y-6">
                  <div className="grid gap-4 bg-muted/30 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-muted-foreground">Project:</span>
                      <span className="text-sm font-medium">{selectedTask.project}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-muted-foreground">Assignee:</span>
                      <span className="text-sm font-medium">{selectedTask.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-muted-foreground">Due Date:</span>
                      <span className="text-sm font-medium">{selectedTask.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-muted-foreground">Status:</span>
                      <Badge variant="secondary" className={`${getStatusColor(selectedTask.status)} text-[11px] font-semibold px-2 py-0.5 border-none shadow-none`}>
                        {selectedTask.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-muted-foreground">Priority:</span>
                      <Badge variant="outline" className={`${getPriorityColor(selectedTask.priority)} text-[10px] font-bold uppercase tracking-wider`}>
                        {selectedTask.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Task Description</h4>
                    <Card className="shadow-sm border-slate-200 bg-slate-50/50">
                      <CardContent className="p-5 overflow-y-auto max-h-[250px] custom-scrollbar">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100/50 p-2.5 rounded-lg shrink-0 mt-0.5 border border-blue-100">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="space-y-2.5 flex-1">
                            <h4 className="font-semibold text-foreground text-base tracking-tight">{selectedTask.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                              {selectedTask.description || "Please ensure to follow the brand guidelines while working on this task. Reach out if you need any resources or have questions. Ensure pixel-perfect margins!"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4 border-t flex justify-end shrink-0 bg-muted/20">
              <Button onClick={() => setSelectedTask(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
