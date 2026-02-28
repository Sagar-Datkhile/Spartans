'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, DollarSign, FileText, FolderPlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: () => void
  projectToEdit?: any | null
}

export default function CreateProjectDialog({ open, onOpenChange, onProjectCreated, projectToEdit }: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { currentUser } = useAppStore()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        setName(projectToEdit.name || '')
        setDescription(projectToEdit.description || '')
        setStartDate(projectToEdit.start_date ? new Date(projectToEdit.start_date).toISOString().split('T')[0] : '')
        setEndDate(projectToEdit.end_date ? new Date(projectToEdit.end_date).toISOString().split('T')[0] : '')
        setBudget(projectToEdit.budget ? projectToEdit.budget.toString() : '')
        setError('')
      } else {
        setName('')
        setDescription('')
        setStartDate('')
        setEndDate('')
        setBudget('')
        setError('')
      }
    }
  }, [projectToEdit, open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    if (!currentUser?.companyId) {
      setError('You must belong to a company to create a project')
      return
    }

    setError('')
    setLoading(true)

    const projectData = {
      company_id: currentUser.companyId,
      name,
      description,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      budget: budget ? parseFloat(budget) : null,
    }

    let queryError = null;

    if (projectToEdit) {
      const { error } = await supabase.from('projects').update(projectData).eq('id', projectToEdit.id)
      queryError = error
    } else {
      const { error } = await supabase.from('projects').insert({
        ...projectData,
        status: 'PLANNING',
        manager_id: currentUser.id
      })
      queryError = error
    }

    setLoading(false)

    if (queryError) {
      setError(queryError.message || (projectToEdit ? 'Failed to update project' : 'Failed to create project'))
      return
    }

    // Reset form
    setName('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setBudget('')

    onProjectCreated?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header styling */}
        <div className="bg-muted/30 px-6 py-4 border-b">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FolderPlus className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">{projectToEdit ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            </div>
            <DialogDescription>
              {projectToEdit ? 'Update project details and information below.' : 'Add a new project to manage with your team. Fill out the details below.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">Project Name *</Label>
            <div className="relative">
              <Input
                id="project-name"
                placeholder="E.g., Website Redesign Q3"
                className="pl-9"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="project-desc"
              placeholder="What are the goals and objectives?"
              className="resize-none min-h-[100px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="date"
                  className="pl-9 [&::-webkit-calendar-picker-indicator]:opacity-0"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="date"
                  className="pl-9 [&::-webkit-calendar-picker-indicator]:opacity-0"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium">Budget</Label>
            <div className="relative">
              <Input
                id="budget"
                type="number"
                placeholder="5000"
                className="pl-9"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              />
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Estimated total cost for this project.</p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {projectToEdit ? 'Saving...' : 'Creating...'}</> : (projectToEdit ? 'Save Changes' : 'Create Project')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
