'use client'

import { useState, useRef, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    BarChart3,
    Calendar,
    User,
    Clock,
    AlertCircle,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
type Status = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'

interface GanttTask {
    id: string
    title: string
    assignee: string
    project: string
    startDate: Date
    endDate: Date
    status: Status
    priority: Priority
    progress: number // 0–100
}

// ─── Static demo data ────────────────────────────────────────────────────────

function getToday() { return new Date() }
function addDays(d: Date, n: number) {
    const r = new Date(d); r.setDate(r.getDate() + n); return r
}

const today = getToday()

const DEMO_TASKS: GanttTask[] = [
    {
        id: 't1', title: 'Design System Setup', assignee: 'Jane Smith',
        project: 'Platform Redesign',
        startDate: addDays(today, -14), endDate: addDays(today, -5),
        status: 'COMPLETED', priority: 'HIGH', progress: 100,
    },
    {
        id: 't2', title: 'API Integration', assignee: 'John Doe',
        project: 'Platform Redesign',
        startDate: addDays(today, -8), endDate: addDays(today, 4),
        status: 'IN_PROGRESS', priority: 'HIGH', progress: 65,
    },
    {
        id: 't3', title: 'User Authentication', assignee: 'Bob Wilson',
        project: 'Platform Redesign',
        startDate: addDays(today, -5), endDate: addDays(today, 7),
        status: 'IN_PROGRESS', priority: 'HIGH', progress: 45,
    },
    {
        id: 't4', title: 'Dashboard Analytics', assignee: 'Jane Smith',
        project: 'Analytics Suite',
        startDate: addDays(today, 0), endDate: addDays(today, 12),
        status: 'TODO', priority: 'MEDIUM', progress: 0,
    },
    {
        id: 't5', title: 'Performance Testing', assignee: 'John Doe',
        project: 'Analytics Suite',
        startDate: addDays(today, 5), endDate: addDays(today, 18),
        status: 'TODO', priority: 'MEDIUM', progress: 0,
    },
    {
        id: 't6', title: 'Mobile Responsive UI', assignee: 'Bob Wilson',
        project: 'Mobile App',
        startDate: addDays(today, -3), endDate: addDays(today, 10),
        status: 'IN_REVIEW', priority: 'HIGH', progress: 85,
    },
    {
        id: 't7', title: 'Documentation', assignee: 'Jane Smith',
        project: 'Mobile App',
        startDate: addDays(today, 8), endDate: addDays(today, 22),
        status: 'TODO', priority: 'LOW', progress: 0,
    },
    {
        id: 't8', title: 'Security Audit', assignee: 'John Doe',
        project: 'Platform Redesign',
        startDate: addDays(today, 10), endDate: addDays(today, 24),
        status: 'TODO', priority: 'HIGH', progress: 0,
    },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Status, string> = {
    TODO: 'bg-gray-400',
    IN_PROGRESS: 'bg-blue-500',
    IN_REVIEW: 'bg-amber-500',
    COMPLETED: 'bg-emerald-500',
}

const STATUS_LABELS: Record<Status, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    COMPLETED: 'Completed',
}

const PRIORITY_COLORS: Record<Priority, string> = {
    LOW: 'text-gray-500 bg-gray-100',
    MEDIUM: 'text-amber-700 bg-amber-100',
    HIGH: 'text-red-700 bg-red-100',
}

function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysBetween(a: Date, b: Date) {
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Add Task Dialog (lightweight inline) ────────────────────────────────────

interface AddTaskDialogProps {
    onClose: () => void
    onAdd: (task: GanttTask) => void
}

function AddTaskDialog({ onClose, onAdd }: AddTaskDialogProps) {
    const [form, setForm] = useState({
        title: '',
        assignee: '',
        project: '',
        startDate: today.toISOString().split('T')[0],
        endDate: addDays(today, 7).toISOString().split('T')[0],
        priority: 'MEDIUM' as Priority,
    })
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim() || !form.assignee.trim() || !form.project.trim()) {
            setError('Please fill in all required fields.')
            return
        }
        const start = new Date(form.startDate)
        const end = new Date(form.endDate)
        if (end <= start) { setError('End date must be after start date.'); return }
        onAdd({
            id: `task-${Date.now()}`,
            title: form.title,
            assignee: form.assignee,
            project: form.project,
            startDate: start,
            endDate: end,
            status: 'TODO',
            priority: form.priority,
            progress: 0,
        })
        onClose()
    }

    const inputClass =
        'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5" /> Add New Task
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Task Title *</label>
                        <input className={inputClass} placeholder="e.g. Build login screen"
                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Assignee *</label>
                            <input className={inputClass} placeholder="Name"
                                value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Project *</label>
                            <input className={inputClass} placeholder="Project name"
                                value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Start Date</label>
                            <input type="date" className={inputClass}
                                value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">End Date</label>
                            <input type="date" className={inputClass}
                                value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Priority</label>
                        <select className={inputClass} value={form.priority}
                            onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                        </div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition bg-card">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Gantt Chart ─────────────────────────────────────────────────────────

const COL_WIDTH = 40 // px per day
const ROW_HEIGHT = 56 // px per task row
const LEFT_PANEL = 280 // px for task label column

export default function GanttChart() {
    const { currentUser } = useAppStore()
    const isManager = currentUser?.role === 'MANAGER' || currentUser?.role === 'SUPERADMIN'

    const [tasks, setTasks] = useState<GanttTask[]>(DEMO_TASKS)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [hoveredTask, setHoveredTask] = useState<string | null>(null)
    const [selectedTask, setSelectedTask] = useState<string | null>(null)
    const [viewOffset, setViewOffset] = useState(0) // days to shift view left/right
    const [filterStatus, setFilterStatus] = useState<Status | 'ALL'>('ALL')
    const scrollRef = useRef<HTMLDivElement>(null)

    // View window: show 30 days centered around today + offset
    const VISIBLE_DAYS = 30
    const viewStart = useMemo(() => addDays(today, -10 + viewOffset), [viewOffset])
    const viewEnd = useMemo(() => addDays(viewStart, VISIBLE_DAYS), [viewStart])

    const days = useMemo(() => {
        return Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(viewStart, i))
    }, [viewStart])

    const filteredTasks = useMemo(() =>
        tasks.filter(t => filterStatus === 'ALL' || t.status === filterStatus),
        [tasks, filterStatus]
    )

    const getBarStyle = (task: GanttTask) => {
        const startOffset = daysBetween(viewStart, task.startDate)
        const duration = daysBetween(task.startDate, task.endDate)

        const clampedStart = Math.max(0, startOffset)
        const clampedEnd = Math.min(VISIBLE_DAYS, startOffset + duration)
        const clampedDuration = clampedEnd - clampedStart

        if (clampedDuration <= 0) return null

        return {
            left: clampedStart * COL_WIDTH,
            width: clampedDuration * COL_WIDTH - 4,
        }
    }

    const isOverdue = (task: GanttTask) =>
        task.endDate < today && task.status !== 'COMPLETED'

    const isTodayColumn = (d: Date) =>
        d.toDateString() === today.toDateString()

    const addTask = (task: GanttTask) => {
        setTasks(prev => [...prev, task])
    }

    // Summary stats
    const stats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        overdue: tasks.filter(t => isOverdue(t)).length,
    }), [tasks])

    const selectedTaskData = tasks.find(t => t.id === selectedTask)

    return (
        <div className="flex flex-col gap-5">

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tasks', value: stats.total, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Completed', value: stats.completed, icon: Calendar, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
                ].map(stat => (
                    <Card key={stat.label} className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stat.color}`}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Navigation */}
                <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                    <button onClick={() => setViewOffset(v => v - 7)}
                        className="p-1.5 rounded-md hover:bg-muted transition">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium px-2 text-foreground">
                        {formatDate(viewStart)} – {formatDate(viewEnd)}
                    </span>
                    <button onClick={() => setViewOffset(v => v + 7)}
                        className="p-1.5 rounded-md hover:bg-muted transition">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <button onClick={() => setViewOffset(0)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition text-foreground">
                    Today
                </button>

                {/* Filter */}
                <div className="flex items-center gap-1 ml-auto flex-wrap">
                    {(['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'] as const).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${filterStatus === s
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-card text-muted-foreground border-border hover:border-foreground/30'}`}>
                            {s === 'ALL' ? 'All' : STATUS_LABELS[s as Status]}
                        </button>
                    ))}
                </div>

                {/* Add Task — Manager only */}
                {isManager && (
                    <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add Task
                    </Button>
                )}
            </div>

            {/* ── Gantt Grid ── */}
            <Card className="overflow-hidden">
                <div className="flex">

                    {/* Left panel — task labels (sticky) */}
                    <div className="flex-shrink-0 border-r border-border" style={{ width: LEFT_PANEL }}>
                        {/* Header */}
                        <div className="h-14 px-4 flex items-center border-b border-border bg-muted/40">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Task</span>
                        </div>
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => setSelectedTask(prev => prev === task.id ? null : task.id)}
                                className={`flex flex-col justify-center px-4 border-b border-border cursor-pointer transition-colors ${selectedTask === task.id ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
                                style={{ height: ROW_HEIGHT }}
                            >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span
                                        className={`h-2 w-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`}
                                    />
                                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                                    {isOverdue(task) && (
                                        <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 pl-3.5">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground truncate">{task.assignee}</p>
                                    <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right panel — scrollable timeline */}
                    <div className="flex-1 overflow-x-auto" ref={scrollRef}>
                        <div style={{ width: VISIBLE_DAYS * COL_WIDTH, minWidth: '100%' }}>

                            {/* Day headers */}
                            <div className="flex h-14 border-b border-border bg-muted/40 sticky top-0 z-10">
                                {days.map((d, i) => (
                                    <div key={i}
                                        className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-border/50 transition ${isTodayColumn(d) ? 'bg-primary/10' : ''}`}
                                        style={{ width: COL_WIDTH }}>
                                        <span className={`text-[9px] font-medium uppercase ${isTodayColumn(d) ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <span className={`text-xs font-bold ${isTodayColumn(d) ? 'text-primary' : 'text-foreground'}`}>
                                            {d.getDate()}
                                        </span>
                                        {d.getDate() === 1 && (
                                            <span className="text-[9px] text-muted-foreground">
                                                {d.toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Task rows */}
                            <div className="relative">
                                {filteredTasks.map((task) => {
                                    const barStyle = getBarStyle(task)
                                    const isHovered = hoveredTask === task.id
                                    const isSelected = selectedTask === task.id

                                    return (
                                        <div key={task.id}
                                            className={`relative flex items-center border-b border-border transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/20'}`}
                                            style={{ height: ROW_HEIGHT }}
                                        >
                                            {/* Day column backgrounds */}
                                            {days.map((d, i) => (
                                                <div key={i} className={`absolute top-0 bottom-0 border-r border-border/30 ${isTodayColumn(d) ? 'bg-primary/5' : ''}`}
                                                    style={{ left: i * COL_WIDTH, width: COL_WIDTH }} />
                                            ))}

                                            {/* Today vertical line */}
                                            {(() => {
                                                const todayOffset = daysBetween(viewStart, today)
                                                if (todayOffset >= 0 && todayOffset < VISIBLE_DAYS) {
                                                    return (
                                                        <div className="absolute top-0 bottom-0 w-0.5 bg-primary/60 z-10"
                                                            style={{ left: todayOffset * COL_WIDTH }} />
                                                    )
                                                }
                                            })()}

                                            {/* Task bar */}
                                            {barStyle && (
                                                <div
                                                    className="absolute top-3 bottom-3 rounded-full cursor-pointer transition-all group z-10"
                                                    style={{
                                                        left: barStyle.left + 2,
                                                        width: barStyle.width,
                                                        background: task.status === 'COMPLETED'
                                                            ? 'linear-gradient(90deg, #10b981, #059669)'
                                                            : task.status === 'IN_REVIEW'
                                                                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                                : task.status === 'IN_PROGRESS'
                                                                    ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                                                                    : 'linear-gradient(90deg, #9ca3af, #6b7280)',
                                                        boxShadow: (isHovered || isSelected)
                                                            ? '0 4px 16px rgba(0,0,0,0.18)'
                                                            : '0 2px 6px rgba(0,0,0,0.10)',
                                                    }}
                                                    onMouseEnter={() => setHoveredTask(task.id)}
                                                    onMouseLeave={() => setHoveredTask(null)}
                                                    onClick={() => setSelectedTask(prev => prev === task.id ? null : task.id)}
                                                >
                                                    {/* Progress fill */}
                                                    {task.progress > 0 && (
                                                        <div className="absolute inset-0 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full bg-white/25"
                                                                style={{ width: `${task.progress}%` }} />
                                                        </div>
                                                    )}
                                                    {/* Label inside bar */}
                                                    {barStyle.width > 80 && (
                                                        <span className="absolute inset-0 flex items-center px-3 text-[11px] font-semibold text-white truncate">
                                                            {task.title}
                                                            {task.progress > 0 && ` · ${task.progress}%`}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Task detail panel ── */}
            {selectedTaskData && (
                <Card className="p-5 border border-border animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-foreground text-lg">{selectedTaskData.title}</h3>
                            <p className="text-sm text-muted-foreground">{selectedTaskData.project}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={`${PRIORITY_COLORS[selectedTaskData.priority]} border-0`}>
                                {selectedTaskData.priority}
                            </Badge>
                            <Badge className={`${STATUS_COLORS[selectedTaskData.status]} text-white border-0`}>
                                {STATUS_LABELS[selectedTaskData.status]}
                            </Badge>
                            <button onClick={() => setSelectedTask(null)}
                                className="ml-2 text-muted-foreground hover:text-foreground text-lg leading-none">
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                            <div className="flex items-center gap-1.5">
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                    {selectedTaskData.assignee[0]}
                                </div>
                                <span className="font-medium text-foreground">{selectedTaskData.assignee}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                            <p className="font-medium text-foreground">{formatDate(selectedTaskData.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">End Date</p>
                            <p className={`font-medium ${isOverdue(selectedTaskData) ? 'text-red-600' : 'text-foreground'}`}>
                                {formatDate(selectedTaskData.endDate)}
                                {isOverdue(selectedTaskData) && ' · Overdue'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Duration</p>
                            <p className="font-medium text-foreground">
                                {daysBetween(selectedTaskData.startDate, selectedTaskData.endDate)} days
                            </p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs text-muted-foreground">Progress</p>
                            <p className="text-xs font-semibold text-foreground">{selectedTaskData.progress}%</p>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[selectedTaskData.status]}`}
                                style={{ width: `${selectedTaskData.progress}%` }}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* ── Legend ── */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span className="font-medium">Legend:</span>
                {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
                    <div key={s} className="flex items-center gap-1.5">
                        <span className={`h-3 w-3 rounded-sm ${STATUS_COLORS[s]}`} />
                        {STATUS_LABELS[s]}
                    </div>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                    <div className="h-3 w-0.5 bg-primary/60 rounded" />
                    <span>Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    <span>Overdue</span>
                </div>
            </div>

            {/* ── Add Task Modal ── */}
            {showAddDialog && (
                <AddTaskDialog onClose={() => setShowAddDialog(false)} onAdd={addTask} />
            )}
        </div>
    )
}
