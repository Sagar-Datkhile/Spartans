'use client'

import { KPIScore, getStatusColor, getStatusBarColor } from '@/lib/services/kpi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp } from 'lucide-react'

interface KPIScoreCardProps {
    kpi: KPIScore
    showEmployee?: boolean
}

export default function KPIScoreCard({ kpi, showEmployee = false }: KPIScoreCardProps) {
    const progressPct = kpi.score != null ? Math.min(kpi.score, 100) : 0
    const scoreDisplay = kpi.score != null ? `${kpi.score.toFixed(1)}%` : '—'

    return (
        <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{kpi.metric_name}</p>
                        {showEmployee && kpi.employee_name && (
                            <p className="text-xs text-muted-foreground truncate">{kpi.employee_name}</p>
                        )}
                    </div>
                </div>
                {kpi.status ? (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border shrink-0 ${getStatusColor(kpi.status)}`}>
                        {kpi.status}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full border border-dashed">
                        Pending
                    </span>
                )}
            </div>

            {/* Score display */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-3xl font-bold tracking-tight">{scoreDisplay}</p>
                    <p className="text-xs text-muted-foreground">KPI Score</p>
                </div>
                <div className="text-right text-xs text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1 justify-end">
                        <Target className="h-3 w-3" />
                        <span>Target: <strong>{kpi.target_value}</strong></span>
                    </div>
                    <div>
                        Actual: <strong>{kpi.actual_value ?? '—'}</strong>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${getStatusBarColor(kpi.status)}`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>Period: {kpi.period}</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    )
}
