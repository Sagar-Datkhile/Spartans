'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function AnalyticsPage() {
  const { currentUser } = useAppStore()
  const [loading, setLoading] = useState(true)

  const [taskData, setTaskData] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any[]>([])
  const [kpiData, setKpiData] = useState<any[]>([])
  const [stats, setStats] = useState({
    completion: 0,
    health: '0.0',
    productivity: 0
  })

  useEffect(() => {
    async function fetchAnalytics() {
      if (!currentUser?.companyId) return

      setLoading(true)
      const supabase = createClient()

      // Fetch Tasks with their projects
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          projects!inner ( id, name, company_id )
        `)
        .eq('projects.company_id', currentUser.companyId)

      // Calculate task data
      if (!taskError && tasks) {
        let completed = 0;
        let inProgress = 0;
        let onHold = 0; // Using IN_REVIEW or general map for it
        let todo = 0;

        tasks.forEach(t => {
          if (t.status === 'COMPLETED') completed++;
          else if (t.status === 'IN_PROGRESS') inProgress++;
          else if (t.status === 'IN_REVIEW') onHold++;
          else todo++;
        })

        // Filter out empty ones or keep standard 3
        setTaskData([
          { name: 'Completed', value: completed },
          { name: 'In Progress', value: inProgress },
          { name: 'In Review', value: onHold },
          { name: 'To Do', value: todo }
        ].filter(d => d.value > 0))

        const totalTasks = tasks.length
        const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0
        const prod = totalTasks > 0 ? Math.round(((completed + onHold) / totalTasks) * 100) : 0
        const healthScore = totalTasks > 0 ? ((completed * 10 + inProgress * 5) / (totalTasks * 10) * 10).toFixed(1) : '0.0'

        setStats({
          completion: completionRate,
          health: healthScore,
          productivity: prod
        })

        // Group tasks by project to show "Project Completion Rate"
        const projMap: Record<string, { total: number, completed: number }> = {}
        tasks.forEach(t => {
          const pName = t.projects?.name || 'Unknown'
          if (!projMap[pName]) projMap[pName] = { total: 0, completed: 0 }
          projMap[pName].total++;
          if (t.status === 'COMPLETED') projMap[pName].completed++;
        })

        const pData = Object.entries(projMap).map(([name, counts]) => ({
          name: name.length > 15 ? name.substring(0, 15) + '...' : name,
          completion: Math.round((counts.completed / counts.total) * 100)
        })).slice(0, 8)

        setProjectData(pData)
      }

      // Fetch KPIs
      let kpiQuery = supabase
        .from('kpi_scores')
        .select(`
          *,
          users!kpi_scores_employee_id_fkey!inner ( name, company_id )
        `)
        .eq('users.company_id', currentUser.companyId)
        .not('score', 'is', null)

      if (currentUser.role === 'MANAGER') {
        kpiQuery = kpiQuery.eq('manager_id', currentUser.id)
      }

      const { data: kpis, error: kpiError } = await kpiQuery

      if (!kpiError && kpis) {
        const empMap: Record<string, { totalScore: number, count: number }> = {}
        kpis.forEach((k: any) => {
          const empName = k.users?.name || 'Unknown'
          if (!empMap[empName]) empMap[empName] = { totalScore: 0, count: 0 }
          empMap[empName].totalScore += (k.score || 0)
          empMap[empName].count++
        })

        const kData = Object.entries(empMap).map(([name, val]) => ({
          name: name.length > 15 ? name.substring(0, 15) + '...' : name,
          score: Math.round(val.totalScore / val.count)
        })).sort((a, b) => b.score - a.score).slice(0, 8)

        setKpiData(kData)
      }

      setLoading(false)
    }

    fetchAnalytics()
  }, [currentUser?.companyId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track KPIs and performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completion}%</div>
            <p className="text-xs text-muted-foreground">Of all tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Project Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.health}/10</div>
            <p className="text-xs text-muted-foreground">Based on task completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.productivity}%</div>
            <p className="text-xs text-muted-foreground">Resolution rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Overall task status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Completion Rate</CardTitle>
            <CardDescription>Status of active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="completion" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {(currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'MANAGER') && kpiData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team KPI Performance</CardTitle>
            <CardDescription>Average KPI scores across team members</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={kpiData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 120]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {kpiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#10b981' : entry.score >= 75 ? '#3b82f6' : entry.score >= 60 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
