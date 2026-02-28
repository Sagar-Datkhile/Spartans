'use client'

import GanttChart from '@/components/features/gantt/gantt-chart'
import { useAppStore } from '@/lib/store'
import { BarChart3 } from 'lucide-react'

export default function GanttPage() {
    const { currentUser } = useAppStore()
    const isManager = currentUser?.role === 'MANAGER' || currentUser?.role === 'SUPERADMIN'

    return (
        <div className="space-y-6 p-6">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Gantt Chart</h1>
                    </div>
                    <p className="text-muted-foreground">
                        {isManager
                            ? "Visualize, plan and manage your team's tasks on a timeline."
                            : 'View your assigned tasks and project timelines.'}
                    </p>
                </div>
            </div>

            {/* Gantt chart */}
            <GanttChart />
        </div>
    )
}
