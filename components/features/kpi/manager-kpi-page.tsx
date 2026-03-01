'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { KPIScore, getStatusColor, getStatusBarColor } from '@/lib/services/kpi'
import KPIScoreCard from '@/components/features/kpi/kpi-score-card'
import SetKPIDialog from '@/components/features/kpi/set-kpi-dialog'
import UpdateActualDialog from '@/components/features/kpi/update-actual-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Loader2, TrendingUp, Target, Award, AlertTriangle, Plus, Trash2, PenLine,
    Users, BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Employee {
    id: string
    name: string
    email: string
}

export default function ManagerKPIPage() {
    const { currentUser } = useAppStore()
    const [kpis, setKpis] = useState<KPIScore[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [setKPIOpen, setSetKPIOpen] = useState(false)
    const [updateOpen, setUpdateOpen] = useState(false)
    const [selectedKPI, setSelectedKPI] = useState<KPIScore | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    const fetchEmployees = useCallback(async () => {
        if (!currentUser) return
        const supabase = createClient()
        const { data } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('manager_id', currentUser.id)
            .eq('role', 'EMPLOYEE')
        setEmployees(data ?? [])
    }, [currentUser])

    const fetchKPIs = useCallback(async () => {
        if (!currentUser) return
        try {
            const res = await fetch(`/api/kpi?manager_id=${currentUser.id}`)
            if (!res.ok) throw new Error('Failed to fetch KPIs')
            setKpis(await res.json())
        } catch (err: any) {
            toast.error(err.message)
        }
    }, [currentUser])

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await Promise.all([fetchEmployees(), fetchKPIs()])
            setLoading(false)
        }
        init()
    }, [fetchEmployees, fetchKPIs])

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            const res = await fetch(`/api/kpi?id=${deleteTarget}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            toast.success('KPI deleted')
            setDeleteTarget(null)
            fetchKPIs()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    // Summary stats
    const scored = kpis.filter(k => k.score != null)
    const avgScore = scored.length
        ? Math.round(scored.reduce((s, k) => s + (k.score ?? 0), 0) / scored.length * 10) / 10
        : null

    const statuses = {
        Excellent: kpis.filter(k => k.status === 'Excellent').length,
        Good: kpis.filter(k => k.status === 'Good').length,
        Average: kpis.filter(k => k.status === 'Average').length,
        'Needs Improvement': kpis.filter(k => k.status === 'Needs Improvement').length,
        Pending: kpis.filter(k => k.actual_value == null).length,
    }

    // Calculate Leaderboard
    const leaderboard = useMemo(() => {
        const aggregation: Record<string, { totalScore: number; count: number }> = {}
        kpis.forEach(k => {
            if (k.score != null) {
                const name = k.employee_name || 'Anonymous'
                if (!aggregation[name]) aggregation[name] = { totalScore: 0, count: 0 }
                aggregation[name].totalScore += k.score
                aggregation[name].count += 1
            }
        })

        return Object.entries(aggregation)
            .map(([name, data]) => ({
                name,
                avgScore: Math.round(data.totalScore / data.count * 10) / 10
            }))
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 3) // Top 3 for summary
    }, [kpis])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team KPI Management</h1>
                    <p className="text-muted-foreground text-sm">Set targets, track progress, and evaluate your team's performance.</p>
                </div>
                <Button onClick={() => setSetKPIOpen(true)} disabled={employees.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Set KPI Target
                </Button>
            </div>

            {employees.length === 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="flex items-center gap-3 py-4 text-amber-800 text-sm">
                        <Users className="h-5 w-5 shrink-0" />
                        <span>No employees are assigned to you yet. KPI targets can be set once you have team members.</span>
                    </CardContent>
                </Card>
            )}

            {/* Summary cards & Leaderboard */}
            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3 grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Avg Score</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{avgScore != null ? `${avgScore}%` : '—'}</div>
                            <p className="text-xs text-muted-foreground">{scored.length} evaluated KPIs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Excellent</CardTitle>
                            <Award className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">{statuses.Excellent}</div>
                            <p className="text-xs text-muted-foreground">Score ≥ 90%</p>
                        </CardContent>
                    </Card>

                    <Card className="md:hidden lg:block">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <PenLine className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">{statuses.Pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting submission</p>
                        </CardContent>
                    </Card>
                </div>

                {/* mini leaderboard */}
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <Award className="h-3 w-3" />
                            Top Performers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {leaderboard.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground italic py-2">No scores data available.</p>
                        ) : (
                            leaderboard.map((item: { name: string; avgScore: number }, idx: number) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                                            idx === 1 ? 'bg-slate-100 text-slate-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs font-medium truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary">{item.avgScore}%</span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* KPI Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All KPI Records</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {kpis.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Target className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <p className="font-semibold text-muted-foreground">No KPIs set yet</p>
                            <p className="text-sm text-muted-foreground">Click "Set KPI Target" to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Target</TableHead>
                                    <TableHead className="text-right">Actual</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kpis.map((kpi) => (
                                    <TableRow key={kpi.id}>
                                        <TableCell className="font-medium">{kpi.employee_name ?? '—'}</TableCell>
                                        <TableCell>{kpi.metric_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{kpi.period}</TableCell>
                                        <TableCell className="text-right">{kpi.target_value}</TableCell>
                                        <TableCell className="text-right">{kpi.actual_value ?? '—'}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {kpi.score != null ? `${kpi.score.toFixed(1)}%` : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {kpi.status ? (
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(kpi.status)}`}>
                                                    {kpi.status}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Pending</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    title="Update actual value"
                                                    onClick={() => { setSelectedKPI(kpi); setUpdateOpen(true) }}
                                                >
                                                    <PenLine className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    title="Delete KPI"
                                                    onClick={() => setDeleteTarget(kpi.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Status legend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Performance Status Legend</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {[
                        { label: 'Excellent', range: '90–100%' },
                        { label: 'Good', range: '75–89%' },
                        { label: 'Average', range: '60–74%' },
                        { label: 'Needs Improvement', range: 'Below 60%' },
                    ].map(({ label, range }) => (
                        <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${getStatusColor(label as any)}`}>
                            <span>{label}</span>
                            <span className="opacity-70">({range})</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <SetKPIDialog
                open={setKPIOpen}
                onOpenChange={setSetKPIOpen}
                employees={employees}
                onSuccess={fetchKPIs}
            />

            {selectedKPI && (
                <UpdateActualDialog
                    open={updateOpen}
                    onOpenChange={setUpdateOpen}
                    kpi={selectedKPI}
                    onSuccess={fetchKPIs}
                />
            )}

            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete KPI?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the KPI record. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
