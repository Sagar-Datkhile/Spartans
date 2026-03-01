'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Calendar, Clock, Paperclip, CheckCircle2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function EmployeeTaskModal({
    task,
    open,
    onOpenChange,
    onTaskUpdated
}: {
    task: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onTaskUpdated?: () => void
}) {
    const [progress, setProgress] = useState([task?.completed ? 100 : 0])
    const [status, setStatus] = useState(task?.status || 'TODO')
    const [notes, setNotes] = useState('')
    const [timeSpent, setTimeSpent] = useState('')
    const [showReview, setShowReview] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const supabase = createClient()

    // Checklist states
    const [checklist, setChecklist] = useState({
        dependencies: false,
        documents: false,
        managerNotes: false,
        selfReview: false,
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'TODO': return 'text-slate-600 bg-slate-100'
            case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
            case 'IN_REVIEW': return 'text-amber-600 bg-amber-100'
            case 'COMPLETED': return 'text-emerald-600 bg-emerald-100'
            default: return 'text-slate-600 bg-slate-100'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'LOW': return 'text-emerald-700 bg-emerald-50 border-emerald-100'
            case 'MEDIUM': return 'text-amber-700 bg-amber-50 border-amber-100'
            case 'HIGH': return 'text-rose-700 bg-rose-50 border-rose-100'
            default: return 'text-slate-700 bg-slate-50 border-slate-100'
        }
    }

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === 'COMPLETED') {
            setShowReview(true)
        } else {
            setStatus(newStatus)
        }
    }

    const isReviewValid =
        progress[0] === 100 &&
        notes.length >= 20 &&
        checklist.dependencies &&
        checklist.documents &&
        checklist.managerNotes &&
        checklist.selfReview

    const handleSaveProgress = async (isCompleted = false) => {
        setIsSaving(true)

        const finalStatus = isCompleted ? 'COMPLETED' : status

        const updateData: any = {
            status: finalStatus,
            actual_hours: timeSpent ? Number(timeSpent) : null,
        }

        if (finalStatus === 'COMPLETED') {
            updateData.completed_date = new Date().toISOString()
        }

        const { error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', task.id)

        setIsSaving(false)

        if (error) {
            toast.error('Failed to update task')
            console.error(error)
            return
        }

        toast.success(isCompleted ? 'Task marked as completed successfully!' : 'Task updated successfully!')
        onTaskUpdated?.()

        if (isCompleted) {
            setShowReview(false)
        }

        onOpenChange(false)
    }

    const submitCompletion = () => {
        handleSaveProgress(true)
    }

    if (!task) return null

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setShowReview(false)
            onOpenChange(val)
        }}>
            <DialogContent className="max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <div className="flex items-center justify-between pr-6">
                        <DialogTitle className="text-xl">{task.title}</DialogTitle>
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} font-bold`}>
                            {task.priority} Priority
                        </Badge>
                    </div>
                    <DialogDescription>
                        Project: <span className="font-semibold text-foreground">{task.project}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    <div className="space-y-8">
                        {showReview ? (
                            <div className="space-y-6">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-amber-900">Pre-Submission Review</h4>
                                        <p className="text-sm text-amber-700 mt-1">Please confirm the following details before marking this task as completed. Progress must be 100% and work notes must be at least 20 characters.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="py-3 px-4 bg-muted/50 border-b"><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Progress:</span>
                                                <span className="font-medium">{progress[0]}%</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Time Spent:</span>
                                                <span className="font-medium">{timeSpent || '0'} hrs</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground block mb-1">Work Notes:</span>
                                                <p className="p-2 bg-muted rounded text-xs">{notes || 'None provided'}</p>
                                            </div>
                                            {progress[0] < 100 && (
                                                <p className="text-xs text-red-500 font-medium">Progress must be 100%</p>
                                            )}
                                            {notes.length < 20 && (
                                                <p className="text-xs text-red-500 font-medium">Notes must be at least 20 characters</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="py-3 px-4 bg-muted/50 border-b"><CardTitle className="text-sm">Checklist Validation</CardTitle></CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex items-start space-x-2">
                                                <Checkbox id="chk-dep" checked={checklist.dependencies} onCheckedChange={(c) => setChecklist(prev => ({ ...prev, dependencies: !!c }))} />
                                                <label htmlFor="chk-dep" className="text-sm leading-none font-medium">All dependencies completed?</label>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <Checkbox id="chk-doc" checked={checklist.documents} onCheckedChange={(c) => setChecklist(prev => ({ ...prev, documents: !!c }))} />
                                                <label htmlFor="chk-doc" className="text-sm leading-none font-medium">All required documents uploaded?</label>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <Checkbox id="chk-man" checked={checklist.managerNotes} onCheckedChange={(c) => setChecklist(prev => ({ ...prev, managerNotes: !!c }))} />
                                                <label htmlFor="chk-man" className="text-sm leading-none font-medium">Task description read and understood?</label>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <Checkbox id="chk-self" checked={checklist.selfReview} onCheckedChange={(c) => setChecklist(prev => ({ ...prev, selfReview: !!c }))} />
                                                <label htmlFor="chk-self" className="text-sm leading-none font-medium">Self-review confirmation</label>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setShowReview(false)} disabled={isSaving}>Edit Again</Button>
                                    <Button onClick={submitCompletion} disabled={isSaving || !isReviewValid} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {isSaving ? 'Submitting...' : 'Submit'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Task Overview */}
                                <section>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Task Overview</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-muted/30 p-3 rounded-lg border">
                                            <span className="text-xs text-muted-foreground block mb-1">Due Date</span>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-rose-500" />
                                                <span className="font-medium text-sm text-rose-600">{task.dueDate} (2 days left)</span>
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-lg border">
                                            <span className="text-xs text-muted-foreground block mb-1">Milestone</span>
                                            <span className="font-medium text-sm">Phase 1 Delivery</span>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-lg border">
                                            <span className="text-xs text-muted-foreground block mb-1">Status</span>
                                            <Badge variant="secondary" className={`${getStatusColor(status)} shadow-none border-none`}>{status.replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-lg border">
                                            <span className="text-xs text-muted-foreground block mb-1">Dependencies</span>
                                            <span className="font-medium text-sm text-emerald-600">All Cleared</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Task Description */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Task Description</h3>
                                    <Card className="shadow-sm border-slate-200 bg-slate-50/50">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-blue-100/50 p-2.5 rounded-lg shrink-0 mt-0.5 border border-blue-100">
                                                    <AlertCircle className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="space-y-2.5 flex-1">
                                                    <h4 className="font-semibold text-foreground text-base tracking-tight">{task.title}</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                        {task.description || "Please ensure to follow the brand guidelines while working on this task. Reach out if you need any resources or have questions. Ensure pixel-perfect margins!"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* My Work Update */}
                                <section className="bg-white border rounded-lg p-5 shadow-sm space-y-6">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2 border-b pb-3 mb-4">
                                        <Clock className="w-4 h-4" /> My Work Update
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label>Progress ({progress[0]}%)</Label>
                                            <div className="flex items-center gap-4">
                                                <Slider
                                                    value={progress}
                                                    onValueChange={setProgress}
                                                    max={100}
                                                    step={5}
                                                    className="flex-1"
                                                />
                                                <Progress value={progress[0]} className="w-16 transition-all" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Update Status</Label>
                                            <Select value={status} onValueChange={handleStatusChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="TODO">To Do</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                    <SelectItem value="IN_REVIEW">Ready for Review</SelectItem>
                                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between">
                                            <Label>Work Notes</Label>
                                            <span className="text-xs text-muted-foreground">{notes.length}/20 min chars</span>
                                        </div>
                                        <Textarea
                                            placeholder="Detail the work you've completed, obstacles faced, and next steps..."
                                            className="min-h-[100px] resize-y"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-3">
                                            <Label>Attach Files</Label>
                                            <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                                                <Paperclip className="w-5 h-5 mb-2" />
                                                <span className="text-sm">Click to upload or drag & drop</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Time Spent (Hours)</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 2.5"
                                                value={timeSpent}
                                                onChange={(e) => setTimeSpent(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                </section>
                            </>
                        )}
                    </div>
                </div>

                {!showReview && (
                    <div className="p-4 border-t flex justify-end gap-3 shrink-0 bg-muted/20">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={() => handleSaveProgress(false)} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Progress'}</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
