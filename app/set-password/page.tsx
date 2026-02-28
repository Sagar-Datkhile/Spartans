'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'

function SetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const oobCode = searchParams.get('oobCode')  // Firebase sends this in the link
    const email = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'verifying' | 'success' | 'error'>('verifying')
    const [error, setError] = useState('')
    const [verifiedEmail, setVerifiedEmail] = useState(email || '')

    useEffect(() => {
        // Verify the reset code is valid
        if (!oobCode) {
            setStatus('error')
            setError('Invalid or expired invite link. Please ask your administrator to resend the invite.')
            return
        }

        verifyPasswordResetCode(auth, oobCode)
            .then((email) => {
                setVerifiedEmail(email)
                setStatus('idle')
            })
            .catch(() => {
                setStatus('error')
                setError('This invite link has expired or already been used. Please contact your administrator.')
            })
    }, [oobCode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }

        setStatus('loading')
        try {
            await confirmPasswordReset(auth, oobCode!, password)
            setStatus('success')
            // Redirect to login after 2s
            setTimeout(() => router.push('/login'), 2000)
        } catch (err: any) {
            setStatus('idle')
            if (err.code === 'auth/expired-action-code') {
                setError('This invite link has expired. Please ask your administrator to resend the invite.')
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Please choose a stronger password.')
            } else {
                setError('Failed to set password. Please try again.')
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Spartans</h1>
                    <p className="text-slate-400 text-sm">Enterprise Performance Management</p>
                </div>

                <Card className="border-slate-700 bg-slate-800/60 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl text-white">Set Your Password</CardTitle>
                        <CardDescription className="text-slate-400">
                            {verifiedEmail ? (
                                <>Welcome! You&apos;re setting up access for <span className="text-blue-400">{verifiedEmail}</span></>
                            ) : (
                                'Set a secure password to activate your account'
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Verifying state */}
                        {status === 'verifying' && (
                            <div className="flex flex-col items-center gap-3 py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                <p className="text-slate-400 text-sm">Verifying your invite link...</p>
                            </div>
                        )}

                        {/* Error state (invalid/expired link) */}
                        {status === 'error' && (
                            <div className="flex flex-col items-center gap-4 py-6 text-center">
                                <XCircle className="h-12 w-12 text-red-400" />
                                <p className="text-slate-300 font-medium">Link Invalid or Expired</p>
                                <p className="text-slate-400 text-sm">{error}</p>
                                <Button
                                    variant="outline"
                                    className="mt-2 border-slate-600 text-slate-300"
                                    onClick={() => router.push('/login')}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        )}

                        {/* Success state */}
                        {status === 'success' && (
                            <div className="flex flex-col items-center gap-4 py-6 text-center">
                                <CheckCircle2 className="h-12 w-12 text-green-400" />
                                <p className="text-slate-300 font-medium">Password Set Successfully!</p>
                                <p className="text-slate-400 text-sm">Redirecting you to the login page...</p>
                                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                            </div>
                        )}

                        {/* Form state */}
                        {(status === 'idle' || status === 'loading') && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm" className="text-slate-300">Confirm Password</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        placeholder="Re-enter your password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Password strength hints */}
                                <ul className="text-xs text-slate-500 space-y-1 pl-1">
                                    <li className={password.length >= 8 ? 'text-green-400' : ''}>✓ At least 8 characters</li>
                                    <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>✓ One uppercase letter</li>
                                    <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>✓ One number</li>
                                </ul>

                                {error && (
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11"
                                >
                                    {status === 'loading' ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting password...</>
                                    ) : (
                                        'Activate My Account'
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
        }>
            <SetPasswordForm />
        </Suspense>
    )
}
