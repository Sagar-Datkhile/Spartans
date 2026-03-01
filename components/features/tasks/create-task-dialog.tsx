'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Sparkles, Loader2, UserCheck, FileText, Check, ChevronsUpDown, Search } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated?: () => void
}

interface AISuggestion {
  user: {
    id: string;
    name: string;
    email: string;
  };
  scores: {
    total: number;
    workload: number;
    skillMatch: number;
  };
  explanation: string;
}

export default function CreateTaskDialog({ open, onOpenChange, onTaskCreated }: CreateTaskDialogProps) {
  const { currentUser } = useAppStore()

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [employeeOpen, setEmployeeOpen] = useState(false)
  const [dueDate, setDueDate] = useState('')

  // AI State
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])

  // Supabase State
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      if (!currentUser?.companyId || !open) return

      const { data: projData } = await supabase.from('projects').select('id, name').eq('company_id', currentUser.companyId)
      if (projData) setProjectsList(projData)

      const { data: empData, error: empError } = await supabase.from('users').select('id, name, role').eq('company_id', currentUser.companyId)
      if (empError) console.error("Error fetching employees:", empError)
      if (empData) setEmployeesList(empData)
    }
    loadData()
  }, [currentUser?.companyId, open])

  const handleAutoSuggest = async () => {
    if (!title || !projectId || !estimatedHours) {
      toast.error('Please fill in Task Title, Project, and Estimated Hours first.')
      return
    }

    setIsSuggesting(true)
    setSuggestions([])

    try {
      const skillsArray = requiredSkills.split(',').map(s => s.trim()).filter(Boolean)

      const response = await fetch('/api/tasks/suggest-assignee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          companyId: currentUser?.companyId || 'company-1',
          taskTitle: title,
          estimatedHours: Number(estimatedHours),
          requiredSkills: skillsArray
        })
      })

      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const data = await response.json()
      setSuggestions(data.suggestions)
      toast.success('AI Analysis Complete!', { description: 'Found the best team members for this task.' })
    } catch (error) {
      console.error(error)
      toast.error('Failed to get AI suggestions. Ensure your OpenRouter API key is set.')
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleCreate = async () => {
    if (!title || !projectId) {
      toast.error('Task title and project are required')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from('tasks').insert({
      title,
      description,
      project_id: projectId,
      priority: priority ? priority.toUpperCase() : 'MEDIUM',
      estimated_hours: estimatedHours ? Number(estimatedHours) : null,
      assigned_to: assigneeId || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      status: 'TODO',
      created_by: currentUser?.id
    })

    setIsSubmitting(false)

    if (error) {
      toast.error('Failed to create task')
      console.error(error)
      return
    }

    toast.success('Task Created')

    // Reset form
    setTitle('')
    setDescription('')
    setProjectId('')
    setPriority('')
    setEstimatedHours('')
    setRequiredSkills('')
    setAssigneeId('')
    setDueDate('')

    onTaskCreated?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header styling */}
        <div className="bg-muted/30 px-6 py-4 border-b shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Create New Task</DialogTitle>
            </div>
            <DialogDescription>
              Add a new task to track progress and manage workload.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Task Title</Label>
            <Input
              placeholder="e.g. Design Database Schema"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Describe the task details..."
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsList.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* New AI Inputs */}
          <div className="grid grid-cols-2 gap-6 bg-muted/30 p-5 rounded-lg border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estimated Hours</Label>
              <Input
                type="number"
                placeholder="e.g. 15"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Required for accurate AI workload balancing.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Required Skills <span className="text-muted-foreground font-normal">(comma separated)</span></Label>
              <Input
                placeholder="e.g. React, Node.js, Design"
                value={requiredSkills}
                onChange={e => setRequiredSkills(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Assign To</Label>
              <Popover open={employeeOpen} onOpenChange={setEmployeeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeeOpen}
                    className="h-10 w-full justify-between font-normal text-muted-foreground"
                  >
                    {assigneeId && employeesList.length > 0
                      ? <span className="text-foreground truncate">{employeesList.find((emp) => emp.id === assigneeId)?.name}</span>
                      : "Select assignee..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search employee..." />
                    <CommandList className="max-h-[140px] overflow-y-auto custom-scrollbar">
                      <CommandEmpty>No employee found.</CommandEmpty>
                      <CommandGroup>
                        {employeesList.map((emp) => (
                          <CommandItem
                            key={emp.id}
                            value={emp.name} // searching by name works beautifully this way
                            onSelect={() => {
                              setAssigneeId(emp.id === assigneeId ? "" : emp.id)
                              setEmployeeOpen(false)
                            }}
                          >
                            <div className="flex items-center w-full min-w-0">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  assigneeId === emp.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-medium truncate">{emp.name}</span>
                              {emp.role && (
                                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${emp.role === 'MANAGER' ? 'bg-amber-100 text-amber-700' :
                                  emp.role === 'SUPERADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                  {emp.role}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isSuggesting}
                onClick={handleAutoSuggest}
                className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800"
              >
                {isSuggesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Auto-Suggest Assignee
              </Button>
            </div>
          </div>

          {/* AI Suggestions Results */}
          {suggestions.length > 0 && (
            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Recommendations based on Workload & Skills</span>
              </div>

              <div className="grid gap-3">
                {suggestions.map((s, index) => (
                  <Card
                    key={s.user.id}
                    className={`cursor-pointer transition-all hover:border-indigo-300 dark:hover:border-indigo-700 ${assigneeId === s.user.id ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/30' : ''}`}
                    onClick={() => setAssigneeId(s.user.id)}
                  >
                    <CardContent className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 border">
                          <AvatarFallback className={index === 0 ? "bg-indigo-100 text-indigo-700" : ""}>
                            {s.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{s.user.name}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${index === 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-muted text-muted-foreground'}`}>
                              {s.scores.total}% Match
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {s.explanation}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
                            <span>Workload Score: {s.scores.workload}%</span>
                            <span>Skill Match: {s.scores.skillMatch}%</span>
                          </div>
                        </div>
                      </div>

                      {assigneeId === s.user.id ? (
                        <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="hidden sm:flex shrink-0">
                          Select
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pb-2">
            <Label className="text-sm font-medium">Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/20 border-t flex items-center justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog >
  )
}
