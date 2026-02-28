import { Task, Project } from '@/lib/models'

export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  completionRate: number
  overdueTasks: number
  inProgressTasks: number
  todoTasks: number
}

export interface ProjectAnalytics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  averageCompletion: number
  highRiskProjects: number
}

export interface TeamAnalytics {
  totalMembers: number
  activeMembers: number
  averageTasksPerMember: number
  teamProductivity: number
}

export function calculateTaskAnalytics(tasks: Task[]): TaskAnalytics {
  const now = new Date()
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const todo = tasks.filter((t) => t.status === 'TODO').length
  const overdue = tasks.filter(
    (t) => t.dueDate.toDate() < now && t.status !== 'COMPLETED'
  ).length

  return {
    totalTasks: tasks.length,
    completedTasks: completed,
    completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    overdueTasks: overdue,
    inProgressTasks: inProgress,
    todoTasks: todo,
  }
}

export function calculateProjectAnalytics(projects: Project[]): ProjectAnalytics {
  const completed = projects.filter((p) => p.status === 'COMPLETED').length
  const active = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const highRisk = projects.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length

  // Average completion would be calculated from tasks, but approximating here
  const averageCompletion =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => {
            // In real scenario, calculate from project tasks
            return sum + (p.status === 'COMPLETED' ? 100 : 50)
          }, 0) / projects.length
        )
      : 0

  return {
    totalProjects: projects.length,
    activeProjects: active,
    completedProjects: completed,
    averageCompletion,
    highRiskProjects: highRisk,
  }
}

export function calculateKPI(tasks: Task[], targetKPI: number): { current: number; target: number; variance: number } {
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const current = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
  const variance = current - targetKPI

  return { current, target: targetKPI, variance }
}

export function calculateRiskScore(project: Project, tasks: Task[]): number {
  let score = 0

  // Risk level contribution
  const riskLevelScores: Record<string, number> = {
    LOW: 10,
    MEDIUM: 25,
    HIGH: 50,
    CRITICAL: 100,
  }
  score += riskLevelScores[project.riskLevel] || 0

  // Overdue tasks contribution
  const now = new Date()
  const overdueTasks = tasks.filter(
    (t) => t.dueDate.toDate() < now && t.status !== 'COMPLETED'
  ).length
  score += overdueTasks * 5

  // Project status
  if (project.status === 'ON_HOLD') score += 20

  return Math.min(score, 100)
}
