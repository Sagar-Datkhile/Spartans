import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
    try {
        const { email, name, role, companyId, departmentId, phone, createdBy } = await req.json()

        if (!email || !name || !role || !companyId) {
            return NextResponse.json({ error: 'email, name, role, companyId are required' }, { status: 400 })
        }

        // 1. Create Firebase Auth account (user won't be able to login until they set password via invite link)
        const userRecord = await adminAuth.createUser({
            email,
            displayName: name,
            disabled: false,
        })

        // 2. Save UserProfile to Firestore with 'pending' status
        const userProfile = {
            id: userRecord.uid,
            email,
            name,
            role,
            companyId,
            departmentId: departmentId || null,
            phone: phone || null,
            status: 'pending', // becomes 'active' on first login
            avatar: null,
            createdBy: createdBy || 'system',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }
        await adminDb.collection('users').doc(userRecord.uid).set(userProfile)

        // 3. Generate password reset link (acts as invite — user sets their own password)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const link = await adminAuth.generatePasswordResetLink(email, {
            url: `${appUrl}/set-password?email=${encodeURIComponent(email)}`,
        })

        // 4. Send the invite email using Firebase's built-in email sender
        //    (The generatePasswordResetLink sends the email automatically when called
        //     via sendPasswordResetEmail — here we have the link, can use any mailer)
        //
        //    For now: Firebase Admin's generatePasswordResetLink returns the link.
        //    We trigger the actual email send via the REST API below.
        const sendEmailRes = await fetch(
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

        if (!sendEmailRes.ok) {
            const err = await sendEmailRes.json()
            console.error('Failed to send invite email:', err)
            // Don't throw — user is already created, admin can resend later
        }

        return NextResponse.json({
            success: true,
            userId: userRecord.uid,
            message: `Invite sent to ${email}`,
        })
    } catch (error: any) {
        console.error('Invite error:', error)

        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 })
        }

        return NextResponse.json({ error: error.message || 'Failed to invite user' }, { status: 500 })
    }
}
