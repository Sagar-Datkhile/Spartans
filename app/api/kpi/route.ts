import { NextRequest, NextResponse } from 'next/server'
import { calculateKPIScore, getKPIStatus, KPIScore } from '@/lib/services/kpi'

// In-memory mock database for KPIs
let mockKPIs: KPIScore[] = []

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
        } else {
            return NextResponse.json({ error: 'Provide employee_id or manager_id' }, { status: 400 })
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
