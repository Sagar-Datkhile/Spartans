'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Sparkles, Loader2, UserCheck } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export default function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { employees, currentUser } = useAppStore()

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')

  // AI State
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])

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

  const handleCreate = () => {
    toast.success('Task Created')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to track progress and manage workload.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Task Title</Label>
            <Input
              placeholder="e.g. Design Database Schema"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the task details..."
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-1">Website Redesign</SelectItem>
                  <SelectItem value="project-2">Mobile App</SelectItem>
                  <SelectItem value="project-3">API Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
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
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
            <div>
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                placeholder="e.g. 15"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Required for accurate AI workload balancing.</p>
            </div>
            <div>
              <Label>Required Skills (comma separated)</Label>
              <Input
                placeholder="e.g. React, Node.js, Design"
                value={requiredSkills}
                onChange={e => setRequiredSkills(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label>Assign To</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.role === 'EMPLOYEE').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <span>{emp.name}</span>
                        {emp.status && (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <span className="flex items-center justify-center p-0.5" tabIndex={-1}>
                                  <Info className="h-4 w-4 text-muted-foreground/70 transition-colors" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl leading-none">{emp.status.emoji}</span>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{emp.status.text}</span>
                                    {emp.status.duration && (
                                      <span className="text-xs text-muted-foreground">{emp.status.duration}</span>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="w-full sm:w-auto">Create Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
