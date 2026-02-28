'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

function SetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const oobCode = searchParams.get('oobCode')
    const emailParam = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [status, setStatus] = useState<'verifying' | 'idle' | 'loading' | 'success' | 'error'>('verifying')
    const [error, setError] = useState('')
    const [verifiedEmail, setVerifiedEmail] = useState(emailParam || '')

    useEffect(() => {
        if (!oobCode) {
            setStatus('error')
            setError('Invalid or expired invite link. Please ask your administrator to resend.')
            return
        }
        verifyPasswordResetCode(auth, oobCode)
            .then((email) => { setVerifiedEmail(email); setStatus('idle') })
            .catch(() => {
                setStatus('error')
                setError('This invite link has expired or already been used.')
            })
    }, [oobCode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
        if (password !== confirm) { setError('Passwords do not match.'); return }
        setStatus('loading')
        try {
            await confirmPasswordReset(auth, oobCode!, password)
            setStatus('success')
            setTimeout(() => router.push('/login'), 2000)
        } catch (err: any) {
            setStatus('idle')
            setError(err.code === 'auth/weak-password'
                ? 'Password is too weak. Please choose a stronger one.'
                : 'Failed to set password. The link may have expired.')
        }
    }

    const checks = [
        { label: 'At least 8 characters', pass: password.length >= 8 },
        { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
        { label: 'One number', pass: /[0-9]/.test(password) },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Brand */}
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                        <p className="font-bold text-xl text-gray-900 leading-tight">Spartans</p>
                        <p className="text-xs text-gray-500">Performance Management</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

                    {/* Verifying */}
                    {status === 'verifying' && (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            <p className="text-sm text-gray-500">Verifying your invite link...</p>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-6 text-center">
                            <XCircle className="h-12 w-12 text-red-400" />
                            <div>
                                <p className="font-semibold text-gray-900">Link Invalid or Expired</p>
                                <p className="text-sm text-gray-500 mt-1">{error}</p>
                            </div>
                            <button
                                onClick={() => router.push('/login')}
                                className="mt-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4 py-6 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                            <div>
                                <p className="font-semibold text-gray-900">Password Set!</p>
                                <p className="text-sm text-gray-500 mt-1">Redirecting you to login...</p>
                            </div>
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                    )}

                    {/* Form */}
                    {(status === 'idle' || status === 'loading') && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Set your password</h1>
                            <p className="text-sm text-gray-500 mb-6">
                                {verifiedEmail ? (
                                    <>Setting up access for <span className="font-medium text-gray-800">{verifiedEmail}</span></>
                                ) : 'Activate your Spartans account.'}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="text-sm font-medium text-gray-700">New Password</label>
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-gray-500 hover:text-gray-900 transition">
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimum 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                    <input
                                        id="confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Re-enter your password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                                    />
                                </div>

                                {/* Password strength */}
                                <ul className="space-y-1">
                                    {checks.map((c) => (
                                        <li key={c.label} className={`text-xs flex items-center gap-1.5 ${c.pass ? 'text-green-600' : 'text-gray-400'}`}>
                                            <span>{c.pass ? '✓' : '○'}</span> {c.label}
                                        </li>
                                    ))}
                                </ul>

                                {error && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                >
                                    {status === 'loading' ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" />Setting password...</>
                                    ) : 'Activate My Account'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2025 Spartans Platform · All rights reserved
                </p>
            </div>
        </div>
    )
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        }>
            <SetPasswordForm />
        </Suspense>
    )
}
