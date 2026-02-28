'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import TaskList from '@/components/features/tasks/task-list'
import CreateTaskDialog from '@/components/features/tasks/create-task-dialog'

export default function TasksPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const currentUser = useAppStore((state) => state.currentUser)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Track and manage your tasks</p>
        </div>
        {currentUser?.role !== 'EMPLOYEE' && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      <TaskList />

      <CreateTaskDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
