import { createClient } from '@/lib/supabase/client'

export type KPIStatus = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement'

export interface KPIScore {
  id: string
  employee_id: string
  employee_name?: string
  manager_id: string
  metric_name: string
  target_value: number
  actual_value: number | null
  score: number | null       // (actual / target) * 100
  status: KPIStatus | null
  period: string             // e.g. "2026-03" (YYYY-MM)
  notes?: string
  created_at: string
  updated_at: string
}

export function calculateKPIScore(actual: number, target: number): number {
  if (target === 0) return 0
  return Math.round((actual / target) * 100 * 100) / 100
}

export function getKPIStatus(score: number): KPIStatus {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Average'
  return 'Needs Improvement'
}

export function getStatusColor(status: KPIStatus | null): string {
  switch (status) {
    case 'Excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'Average': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'Needs Improvement': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-500 bg-gray-50 border-gray-200'
  }
}

export function getStatusBarColor(status: KPIStatus | null): string {
  switch (status) {
    case 'Excellent': return 'bg-emerald-500'
    case 'Good': return 'bg-blue-500'
    case 'Average': return 'bg-amber-500'
    case 'Needs Improvement': return 'bg-red-500'
    default: return 'bg-gray-300'
  }
}

// ── Fetch KPIs for a specific employee ──────────────────────────────────────
export async function getEmployeeKPIs(employeeId: string): Promise<KPIScore[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kpi_scores')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── Fetch all KPIs for employees under a manager ─────────────────────────────
export async function getManagerKPIs(managerId: string): Promise<KPIScore[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kpi_scores')
    .select(`
      *,
      users:employee_id (name)
    `)
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    employee_name: row.users?.name ?? 'Unknown',
  }))
}

// ── Create a new KPI (manager sets target) ──────────────────────────────────
export async function createKPI(payload: {
  employee_id: string
  manager_id: string
  metric_name: string
  target_value: number
  period: string
  notes?: string
}): Promise<KPIScore> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kpi_scores')
    .insert({
      ...payload,
      actual_value: null,
      score: null,
      status: null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Update actual value (manager or employee can submit actuals) ─────────────
export async function updateKPIActual(
  kpiId: string,
  actualValue: number
): Promise<KPIScore> {
  const supabase = createClient()

  // Fetch existing to compute score
  const { data: existing, error: fetchErr } = await supabase
    .from('kpi_scores')
    .select('target_value')
    .eq('id', kpiId)
    .single()

  if (fetchErr || !existing) throw fetchErr ?? new Error('KPI not found')

  const score = calculateKPIScore(actualValue, existing.target_value)
  const status = getKPIStatus(score)

  const { data, error } = await supabase
    .from('kpi_scores')
    .update({ actual_value: actualValue, score, status, updated_at: new Date().toISOString() })
    .eq('id', kpiId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Delete a KPI ─────────────────────────────────────────────────────────────
export async function deleteKPI(kpiId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('kpi_scores').delete().eq('id', kpiId)
  if (error) throw error
}
