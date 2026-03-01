'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { UserPlus, Target, ArrowRight, Award, AlertTriangle } from 'lucide-react'
import CreateUserDialog from '@/components/features/users/create-user-dialog'
import { useAppStore } from '@/lib/store'
import { KPIScore } from '@/lib/services/kpi'

const data = [
  { week: 'W1', completed: 12, pending: 8, overdue: 2 },
  { week: 'W2', completed: 19, pending: 5, overdue: 1 },
  { week: 'W3', completed: 15, pending: 9, overdue: 3 },
  { week: 'W4', completed: 22, pending: 6, overdue: 0 },
]

export default function ManagerDashboard() {
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const { currentUser } = useAppStore()
  const [kpis, setKpis] = useState<KPIScore[]>([])
  const [kpiLoading, setKpiLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/kpi?manager_id=${currentUser.id}`)
      .then(r => r.json())
      .then(data => setKpis(Array.isArray(data) ? data : []))
      .catch(() => setKpis([]))
      .finally(() => setKpiLoading(false))
  }, [currentUser])

  const scored = kpis.filter(k => k.score != null)
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, k) => s + (k.score ?? 0), 0) / scored.length * 10) / 10
    : null

  const excellent = kpis.filter(k => k.status === 'Excellent').length
  const needsImprovement = kpis.filter(k => k.status === 'Needs Improvement').length
  const pending = kpis.filter(k => k.actual_value == null).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manager Dashboard</h2>
        <Button onClick={() => setCreateUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Employee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Under your management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team KPI Avg</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore != null ? `${avgScore}%` : '—'}</div>
            <p className="text-xs text-muted-foreground">{scored.length} KPIs evaluated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Task Progress</CardTitle>
          <CardDescription>Task completion trends for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* KPI Summary Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Team KPI Overview</CardTitle>
              <CardDescription>Performance snapshot for your team</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/kpi">
              Manage KPIs <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {kpiLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading KPI data…</p>
          ) : kpis.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No KPI targets set yet. Go to KPI Tracker to set targets for your employees.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{excellent}</p>
                  <p className="text-xs text-muted-foreground">Excellent (≥90%)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pending}</p>
                  <p className="text-xs text-muted-foreground">Pending Submission</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <div className="p-2 rounded-lg bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{needsImprovement}</p>
                  <p className="text-xs text-muted-foreground">Needs Improvement</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
      />
    </div>
  )
}
