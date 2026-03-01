'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FileText, CalendarIcon, DollarSign, Users, Target } from 'lucide-react'

interface ProjectDetailsDialogProps {
    project: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEditClick?: () => void
}

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

export default function ProjectDetailsDialog({ project, open, onOpenChange, onEditClick }: ProjectDetailsDialogProps) {
    if (!project) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                {/* Header styling */}
                <div className="bg-muted/30 px-6 py-5 border-b">
                    <DialogHeader>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 mt-1">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                <DialogTitle className="text-2xl">{project.name}</DialogTitle>
                            </div>
                            <Badge className={`${getStatusColor(project.status)} mr-6`}>
                                {project.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                {/* Form Body */}
                <div className="px-6 py-5 space-y-6">

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Description</span>
                        </div>
                        <p className="text-sm border rounded-lg p-4 bg-muted/20 min-h-[80px]">
                            {project.description || 'No description provided.'}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground font-medium">Overall Progress</span>
                            <span className="font-semibold">0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-muted/20 p-4 rounded-lg border">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Start Date</span>
                            </div>
                            <p className="font-semibold pl-6">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <CalendarIcon className="h-4 w-4" />
                                <span>End Date</span>
                            </div>
                            <p className="font-semibold pl-6">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <DollarSign className="h-4 w-4" />
                                <span>Budget</span>
                            </div>
                            <p className="font-semibold pl-6">{project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Users className="h-4 w-4" />
                                <span>Team Members</span>
                            </div>
                            <p className="font-semibold pl-6">{project.team_member_ids?.length || 0} members</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/20 border-t sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { onOpenChange(false); onEditClick?.(); }}>
                            Edit Project
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
