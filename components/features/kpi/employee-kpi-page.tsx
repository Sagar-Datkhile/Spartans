'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { KPIScore, getStatusColor } from '@/lib/services/kpi'
import KPIScoreCard from '@/components/features/kpi/kpi-score-card'
import UpdateActualDialog from '@/components/features/kpi/update-actual-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, TrendingUp, Target, Award, AlertTriangle, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

export default function EmployeeKPIPage() {
    const { currentUser } = useAppStore()
    const [kpis, setKpis] = useState<KPIScore[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedKPI, setSelectedKPI] = useState<KPIScore | null>(null)
    const [updateOpen, setUpdateOpen] = useState(false)

    const fetchKPIs = useCallback(async () => {
        if (!currentUser) return
        setLoading(true)
        try {
            const res = await fetch(`/api/kpi?employee_id=${currentUser.id}`)
            if (!res.ok) throw new Error('Failed to fetch KPIs')
            const data = await res.json()
            setKpis(data)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }, [currentUser])

    const [leaderboard, setLeaderboard] = useState<{ employee_name: string; avgScore: number }[]>([])
    const [leaderboardLoading, setLeaderboardLoading] = useState(true)

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch('/api/kpi?leaderboard=true')
            const data = await res.json()
            setLeaderboard(data)
        } catch (err) {
            console.error('Leaderboard error:', err)
        } finally {
            setLeaderboardLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchKPIs()
        fetchLeaderboard()
    }, [fetchKPIs, fetchLeaderboard])

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
                    <h1 className="text-2xl font-bold tracking-tight">My KPI Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Track your Key Performance Indicators and performance targets.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    <Award className="h-3.5 w-3.5" />
                    <span>Active Period: March 2026</span>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{avgScore != null ? `${avgScore}%` : '—'}</div>
                        <p className="text-xs text-muted-foreground">{scored.length} of {kpis.length} evaluated</p>
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

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{kpis.length}</div>
                        <p className="text-xs text-muted-foreground">{statuses.Pending} pending submission</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{statuses['Needs Improvement']}</div>
                        <p className="text-xs text-muted-foreground">Score &lt; 60%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* KPI list */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Your KPI Metrics
                    </h2>
                    {kpis.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Target className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                <p className="font-semibold text-muted-foreground">No KPIs assigned yet</p>
                                <p className="text-sm text-muted-foreground">Your manager will set KPI targets for you.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {kpis.map((kpi) => (
                                <div key={kpi.id} className="space-y-2">
                                    <KPIScoreCard kpi={kpi} />
                                    <Button
                                        size="sm"
                                        variant={kpi.actual_value == null ? 'default' : 'outline'}
                                        className="w-full"
                                        onClick={() => { setSelectedKPI(kpi); setUpdateOpen(true) }}
                                    >
                                        {kpi.actual_value == null ? 'Submit Actual Value' : 'Update Actual Value'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Leaderboard Section */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            Top Team Performers
                        </CardTitle>
                        <CardDescription>Top employees by average KPI score</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leaderboardLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No performance data yet.
                            </div>
                        ) : (
                            leaderboard.map((item, idx) => (
                                <div key={item.employee_name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                            #{idx + 1}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium leading-none">{item.employee_name}</p>
                                            <p className="text-[10px] text-muted-foreground">March 2026</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-bold text-primary">{item.avgScore}%</div>
                                        {idx === 0 && <Award className="h-4 w-4 text-amber-500 fill-amber-500" />}
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="pt-4 mt-4 border-t border-dashed">
                            <p className="text-[10px] text-muted-foreground text-center italic">
                                Performance data is updated in real-time.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

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

            {selectedKPI && (
                <UpdateActualDialog
                    open={updateOpen}
                    onOpenChange={setUpdateOpen}
                    kpi={selectedKPI}
                    onSuccess={fetchKPIs}
                />
            )}
        </div>
    )
}
