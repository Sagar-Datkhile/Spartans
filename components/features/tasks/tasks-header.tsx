'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import CreateTaskDialog from './create-task-dialog'

export default function TasksHeader({ employees, projects }: { employees: any[], projects: any[] }) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const { currentUser } = useAppStore()

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Tasks</h1>
                <p className="text-muted-foreground">Track and manage your tasks</p>
            </div>
            {currentUser?.role !== 'EMPLOYEE' && (
                <>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                    <CreateTaskDialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                        employees={employees}
                        projects={projects}
                    />
                </>
            )}
        </div>
    )
}
