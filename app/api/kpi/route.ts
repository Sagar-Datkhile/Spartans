import { NextRequest, NextResponse } from 'next/server'
import { calculateKPIScore, getKPIStatus, KPIScore } from '@/lib/services/kpi'

// In-memory mock database for KPIs
let mockKPIs: KPIScore[] = [
    {
        id: '1', employee_id: 'emp1', manager_id: 'mgr1', employee_name: 'Spartans Code', metric_name: 'Project Completion',
        target_value: 100, actual_value: 95, score: 95, status: 'Excellent', period: '2026-03', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
        id: '2', employee_id: 'emp1', manager_id: 'mgr1', employee_name: 'Spartans Code', metric_name: 'Code Review Quality',
        target_value: 80, actual_value: 70, score: 87.5, status: 'Good', period: '2026-03', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
        id: '3', employee_id: 'emp2', manager_id: 'mgr1', employee_name: 'Alex Johnson', metric_name: 'Documentation',
        target_value: 10, actual_value: 9, score: 90, status: 'Excellent', period: '2026-03', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
        id: '4', employee_id: 'emp3', manager_id: 'mgr1', employee_name: 'Sarah Chen', metric_name: 'Bug Fix Rate',
        target_value: 50, actual_value: 46, score: 92, status: 'Excellent', period: '2026-03', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }
]

function generateId() {
    return Math.random().toString(36).substring(2, 15)
}

// GET /api/kpi?employee_id=xxx  OR  ?manager_id=xxx
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const employeeId = searchParams.get('employee_id')
        const managerId = searchParams.get('manager_id')

        let results = [...mockKPIs]

        if (employeeId) {
            results = results.filter(k => k.employee_id === employeeId)
        } else if (managerId) {
            results = results.filter(k => k.manager_id === managerId)
        } else if (searchParams.get('leaderboard')) {
            // Aggregate by employee
            const aggregation: Record<string, { totalScore: number; count: number }> = {}
            results.forEach(k => {
                if (k.score != null) {
                    const name = k.employee_name || 'Anonymous'
                    if (!aggregation[name]) aggregation[name] = { totalScore: 0, count: 0 }
                    aggregation[name].totalScore += k.score
                    aggregation[name].count += 1
                }
            })

            const leaderboard = Object.entries(aggregation).map(([name, data]) => ({
                employee_name: name,
                avgScore: Math.round(data.totalScore / data.count * 10) / 10
            }))

            leaderboard.sort((a, b) => b.avgScore - a.avgScore)
            return NextResponse.json(leaderboard.slice(0, 5)) // Top 5
        } else {
            return NextResponse.json({ error: 'Provide employee_id, manager_id or leaderboard=true' }, { status: 400 })
        }

        // Sort by created_at descending
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return NextResponse.json(results)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// POST /api/kpi  — create a KPI target (manager only)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { employee_id, manager_id, metric_name, target_value, period, notes } = body

        if (!employee_id || !manager_id || !metric_name || target_value == null || !period) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Mock getting employee name (assuming it's passed or mocked)
        const employee_name = employee_id === 'emp1' ? 'Spartans@code' : 'Unknown Employee'

        const newKPI: KPIScore = {
            id: generateId(),
            employee_id,
            manager_id,
            employee_name,
            metric_name,
            target_value,
            period,
            notes: notes ?? null,
            actual_value: null,
            score: null,
            status: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        mockKPIs.push(newKPI)

        return NextResponse.json(newKPI, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// PUT /api/kpi  — update actual value
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, actual_value } = body

        if (!id || actual_value == null) {
            return NextResponse.json({ error: 'id and actual_value are required' }, { status: 400 })
        }

        const kpiIndex = mockKPIs.findIndex(k => k.id === id)

        if (kpiIndex === -1) {
            return NextResponse.json({ error: 'KPI not found' }, { status: 404 })
        }

        const existing = mockKPIs[kpiIndex]
        const score = calculateKPIScore(actual_value, existing.target_value)
        const status = getKPIStatus(score)

        mockKPIs[kpiIndex] = {
            ...existing,
            actual_value,
            score,
            status,
            updated_at: new Date().toISOString()
        }

        return NextResponse.json(mockKPIs[kpiIndex])
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// DELETE /api/kpi?id=xxx
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const initialLength = mockKPIs.length
        mockKPIs = mockKPIs.filter(k => k.id !== id)

        if (mockKPIs.length === initialLength) {
            return NextResponse.json({ error: 'KPI not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
