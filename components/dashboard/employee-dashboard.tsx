'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { KPIScore, getStatusColor, getStatusBarColor } from '@/lib/services/kpi'
import { Target, TrendingUp, ArrowRight } from 'lucide-react'

export default function EmployeeDashboard() {
  const { currentUser } = useAppStore()
  const [kpis, setKpis] = useState<KPIScore[]>([])
  const [kpiLoading, setKpiLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/kpi?employee_id=${currentUser.id}`)
      .then(r => r.json())
      .then(data => setKpis(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setKpis([]))
      .finally(() => setKpiLoading(false))
  }, [currentUser])

  const scored = kpis.filter(k => k.score != null)
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, k) => s + (k.score ?? 0), 0) / scored.length * 10) / 10
    : null

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Total assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">On-time completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Projects</CardTitle>
            <CardDescription>Projects you are assigned to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Website Redesign', progress: 75 },
              { name: 'Mobile App', progress: 50 },
              { name: 'API Integration', progress: 90 },
            ].map((project) => (
              <div key={project.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { task: 'Design mockups', date: 'Tomorrow' },
              { task: 'Submit report', date: 'in 2 days' },
              { task: 'Team meeting prep', date: 'in 3 days' },
            ].map((item) => (
              <div key={item.task} className="flex items-center justify-between text-sm">
                <span>{item.task}</span>
                <span className="text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* KPI Summary Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>My KPI Performance</CardTitle>
              <CardDescription>Your latest Key Performance Indicators</CardDescription>
            </div>
          </div>
          {avgScore != null && (
            <div className="text-right">
              <div className="text-2xl font-bold">{avgScore}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {kpiLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <TrendingUp className="h-4 w-4 animate-pulse" />
              Loading KPIs…
            </div>
          ) : kpis.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No KPI targets have been assigned yet.
            </div>
          ) : (
            kpis.map((kpi) => (
              <div key={kpi.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{kpi.metric_name}</span>
                  <div className="flex items-center gap-2">
                    {kpi.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(kpi.status)}`}>
                        {kpi.status}
                      </span>
                    )}
                    <span className="font-semibold text-muted-foreground">
                      {kpi.score != null ? `${kpi.score.toFixed(1)}%` : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getStatusBarColor(kpi.status)}`}
                    style={{ width: `${kpi.score != null ? Math.min(kpi.score, 100) : 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/kpi">
              View All KPIs <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
