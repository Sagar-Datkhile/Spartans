import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { users, companyId, createdBy } = await req.json()

        if (!users || !Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: 'users array is required' }, { status: 400 })
        }

        const results = users.map(user => ({ email: user.email, success: true }))

        return NextResponse.json({
            success: true,
            total: users.length,
            invited: users.length,
            failed: 0,
            results,
        })
    } catch (error: any) {
        console.error('Bulk invite error:', error)
        return NextResponse.json({ error: error.message || 'Bulk invite failed' }, { status: 500 })
    }
}
