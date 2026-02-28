import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { email, name, role, companyId, departmentId, phone, createdBy } = await req.json()

        if (!email || !name || !role || !companyId) {
            return NextResponse.json({ error: 'email, name, role, companyId are required' }, { status: 400 })
        }

        // Dummy success
        return NextResponse.json({
            success: true,
            userId: "dummy-user-id",
            message: `Invite sent to ${email}`,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to invite user' }, { status: 500 })
    }
}
