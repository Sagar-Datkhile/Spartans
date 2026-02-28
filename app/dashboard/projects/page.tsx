'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ProjectList from '@/components/features/projects/project-list'
import CreateProjectDialog from '@/components/features/projects/create-project-dialog'

export default function ProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [projectToEdit, setProjectToEdit] = useState<any>(null)

  const handleProjectCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleEditProject = (project: any) => {
    setProjectToEdit(project)
    setIsCreateDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      setTimeout(() => setProjectToEdit(null), 300)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track your projects</p>
        </div>
        <Button onClick={() => { setProjectToEdit(null); setIsCreateDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <ProjectList refreshKey={refreshKey} onEditProject={handleEditProject} />

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={handleDialogChange}
        onProjectCreated={handleProjectCreated}
        projectToEdit={projectToEdit}
      />
    </div>
  )
}
