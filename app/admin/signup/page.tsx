'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'

const passwordRules = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /\d/.test(p) },
]

export default function AdminSignupPage() {
    const router = useRouter()
    const { setCurrentUser } = useAppStore()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<1 | 2>(1)

    const passwordValid = passwordRules.every(r => r.test(password))
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!name.trim() || !companyName.trim()) {
            setError('Please fill in all fields.')
            return
        }
        setStep(2)
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!passwordValid) { setError('Password does not meet requirements.'); return }
        if (!passwordsMatch) { setError('Passwords do not match.'); return }
        setLoading(true)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, companyName, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed')
            }

            // Immediately login the user after successful signup
            const supabase = createClient()
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError || !authData.user) {
                throw new Error('Signup successful, but failed to automatically log in.')
            }

            // Fetch profile data to load globally
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single()

            if (profileError || !profile) {
                await supabase.auth.signOut()
                throw new Error('Account profile not found after signup.')
            }

            setCurrentUser({
                id: authData.user.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                avatar: profile.avatar_url,
                companyId: profile.company_id,
                departmentId: profile.department_id,
                createdAt: new Date(profile.created_at),
                updatedAt: new Date(profile.updated_at),
            })

            router.push('/dashboard/superadmin')
        } catch (err: any) {
            console.error('Signup error:', err)
            setError(err.message || 'Failed to create account. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 mb-8">
                <div className="h-9 w-9 rounded-lg bg-gray-900 flex items-center justify-center">
                    <span className="text-white font-bold text-base">S</span>
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">Spartans</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Performance Management</p>
                </div>
            </Link>

            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-7">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${step >= 1 ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                        1
                    </div>
                    <div className={`flex-1 h-0.5 rounded-full transition-all ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${step >= 2 ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                        2
                    </div>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                    {step === 1 ? 'Create your Admin account' : 'Secure your account'}
                </h1>
                <p className="text-sm text-gray-400 mb-7">
                    {step === 1
                        ? 'Step 1 of 2 — Tell us about yourself and your organization.'
                        : 'Step 2 of 2 — Set a strong password to protect your account.'}
                </p>

                {/* ── Step 1 ── */}
                {step === 1 && (
                    <form onSubmit={handleContinue} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                id="signup-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company / Organization</label>
                            <input
                                type="text"
                                id="signup-company"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                placeholder="Acme Corp"
                                required
                                className="w-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Email</label>
                            <input
                                type="email"
                                id="signup-email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className="w-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-150 shadow-sm hover:shadow-md mt-2"
                        >
                            Continue
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </form>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="signup-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    required
                                    className="w-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {password && (
                                <div className="mt-3 grid grid-cols-2 gap-1.5">
                                    {passwordRules.map(rule => {
                                        const passed = rule.test(password)
                                        return (
                                            <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {rule.label}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    id="signup-confirm"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat your password"
                                    required
                                    className={`w-full border bg-white text-gray-900 placeholder:text-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-1 transition ${confirmPassword
                                        ? passwordsMatch
                                            ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500'
                                            : 'border-red-300 focus:border-red-400 focus:ring-red-400'
                                        : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900'
                                        }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="text-red-500 text-xs mt-1.5">Passwords do not match</p>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400 text-sm font-medium transition bg-white"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !passwordValid || !passwordsMatch}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
                            >
                                {loading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                                    : 'Create Admin Account'
                                }
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-gray-900 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <p className="text-gray-300 text-xs mt-6">© 2025 Spartans Platform · All rights reserved</p>
        </div>
    )
}
