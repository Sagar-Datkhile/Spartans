'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GanttPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gantt Chart</h1>
        <p className="text-muted-foreground">Visualize project timelines and dependencies</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>View all projects and their scheduled dates</CardDescription>
        </CardHeader>
        <CardContent className="flex h-96 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Gantt chart visualization coming soon</p>
            <p className="text-sm mt-2">This feature will display project timelines and task dependencies</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
