'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Calendar, User } from 'lucide-react'

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
      return 'bg-gray-500'
    case 'IN_PROGRESS':
      return 'bg-blue-500'
    case 'IN_REVIEW':
      return 'bg-yellow-500'
    case 'COMPLETED':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW':
      return 'bg-green-100 text-green-800'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800'
    case 'HIGH':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function TaskList() {
  return (
    <div className="space-y-3">
      {mockTasks.map((task) => (
        <Card key={task.id} className="flex items-center gap-4 p-4">
          <Checkbox defaultChecked={task.completed} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1">{task.project}</p>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{task.dueDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{task.assignee}</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            View
          </Button>
        </Card>
      ))}
    </div>
  )
}
