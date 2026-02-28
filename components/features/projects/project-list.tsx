'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: 'IN_PROGRESS',
    progress: 65,
    team: 5,
    budget: '$25,000',
    dueDate: '2026-06-30',
  },
  {
    id: '2',
    name: 'Mobile App Launch',
    description: 'Native iOS and Android app',
    status: 'IN_PROGRESS',
    progress: 45,
    team: 8,
    budget: '$50,000',
    dueDate: '2026-08-31',
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Third-party API integration',
    status: 'PLANNING',
    progress: 10,
    team: 3,
    budget: '$12,000',
    dueDate: '2026-04-30',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PLANNING':
      return 'bg-blue-500'
    case 'IN_PROGRESS':
      return 'bg-yellow-500'
    case 'ON_HOLD':
      return 'bg-red-500'
    case 'COMPLETED':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

export default function ProjectList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockProjects.map((project) => (
        <Card key={project.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </div>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Team</p>
                <p className="font-semibold">{project.team} members</p>
              </div>
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-semibold">{project.budget}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Due Date</p>
              <p className="font-semibold">{project.dueDate}</p>
            </div>

            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
