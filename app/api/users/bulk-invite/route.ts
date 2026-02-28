import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { Timestamp, WriteBatch } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
    try {
        const { users, companyId, createdBy } = await req.json()

        if (!users || !Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: 'users array is required' }, { status: 400 })
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const results: { email: string; success: boolean; error?: string }[] = []
        const batch = adminDb.batch()

        for (const user of users) {
            try {
                const { email, name, role, departmentId, phone } = user

                // Create Firebase Auth account
                const userRecord = await adminAuth.createUser({ email, displayName: name })

                // Add to Firestore batch
                const userRef = adminDb.collection('users').doc(userRecord.uid)
                batch.set(userRef, {
                    id: userRecord.uid,
                    email,
                    name,
                    role: role?.toUpperCase() || 'EMPLOYEE',
                    companyId,
                    departmentId: departmentId || null,
                    phone: phone || null,
                    status: 'pending',
                    avatar: null,
                    createdBy: createdBy || 'system',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                })

                // Send invite email
                await fetch(
                    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            requestType: 'PASSWORD_RESET',
                            email,
                            continueUrl: `${appUrl}/set-password?email=${encodeURIComponent(email)}`,
                        }),
                    }
                )

                results.push({ email, success: true })
            } catch (err: any) {
                results.push({ email: user.email, success: false, error: err.message })
            }
        }

        // Commit all Firestore writes at once
        await batch.commit()

        const successCount = results.filter((r) => r.success).length
        return NextResponse.json({
            success: true,
            total: users.length,
            invited: successCount,
            failed: users.length - successCount,
            results,
        })
    } catch (error: any) {
        console.error('Bulk invite error:', error)
        return NextResponse.json({ error: error.message || 'Bulk invite failed' }, { status: 500 })
    }
}
