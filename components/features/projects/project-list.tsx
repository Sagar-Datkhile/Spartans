'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'
import ProjectDetailsDialog from './project-details-dialog'

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

export default function ProjectList({ refreshKey, onEditProject }: { refreshKey?: number, onEditProject?: (project: any) => void }) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { currentUser } = useAppStore()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProjects() {
      if (!currentUser?.companyId) return
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', currentUser.companyId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProjects(data)
      }
      setLoading(false)
    }

    fetchProjects()
  }, [currentUser?.companyId, refreshKey])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-card/50 border-dashed">
        <h3 className="text-lg font-medium text-foreground mb-1">No projects yet</h3>
        <p className="text-muted-foreground text-sm">Create a project to get started.</p>
      </div>
    )
  }

  const handleViewDetails = (project: any) => {
    setSelectedProject(project)
    setIsDetailsOpen(true)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="truncate pr-2">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">{project.description}</CardDescription>
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
                <span className="font-semibold">0%</span>
              </div>
              <Progress value={0} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Team</p>
                <p className="font-semibold">{project.team_member_ids?.length || 0} members</p>
              </div>
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-semibold">{project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Due Date</p>
              <p className="font-semibold">{project.end_date || 'No Date'}</p>
            </div>

            <Button variant="outline" className="w-full" onClick={() => handleViewDetails(project)}>
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
      <ProjectDetailsDialog
        project={selectedProject}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEditClick={() => onEditProject?.(selectedProject)}
      />
    </div>
  )
}
