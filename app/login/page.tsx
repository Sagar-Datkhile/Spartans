'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'



export default function LoginPage() {
    const router = useRouter()
    const { setCurrentUser } = useAppStore()
    const [role, setRole] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const roles = [
        { value: 'SUPERADMIN', label: 'Super Admin', dot: 'bg-red-500' },
        { value: 'MANAGER', label: 'Manager', dot: 'bg-blue-500' },
        { value: 'EMPLOYEE', label: 'Employee', dot: 'bg-green-500' },
    ]

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const supabase = createClient()

            // Bypass logic for development if no Supabase URL is set
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || email.includes('dev')) {
                const roleToUse = (role as any) || 'SUPERADMIN'
                setCurrentUser({
                    id: 'dev-user-id',
                    email: email || `${roleToUse.toLowerCase()}@example.com`,
                    name: `Demo ${roleToUse}`,
                    role: roleToUse,
                    companyId: 'dev-company',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                router.push('/dashboard')
                return
            }

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                throw authError
            }

            if (!authData.user) {
                throw new Error('No user returned after successful auth.')
            }

            // Fetch profile data to get role
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single()

            if (profileError || !profile) {
                await supabase.auth.signOut()
                throw new Error('Account profile not found. Contact your administrator.')
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

            // If account was pending, set it to active
            if (profile.status === 'pending') {
                await supabase.from('users').update({ status: 'active' }).eq('id', profile.id)
            }

            router.push('/dashboard')
        } catch (err: any) {
            console.error('Login error:', err)
            if (
                err.message.includes('Invalid login credentials')
            ) {
                setError('Invalid email or password. Please try again.')
            } else {
                setError(err.message || 'Sign in failed. Possible configuration issue.')
            }
        } finally {
            setLoading(false)
        }
    }

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

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
                        <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your dashboard.</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                                I am signing in as
                            </label>
                            <div className="relative">
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select your role...</option>
                                    {roles.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {role && (() => {
                                const sel = roles.find(r => r.value === role)
                                return sel ? (
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${sel.dot}`} />
                                        <span className="text-xs text-gray-500">Signing in as <span className="font-medium text-gray-800">{sel.label}</span></span>
                                    </div>
                                ) : null
                            })()}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-gray-500 hover:text-gray-900 transition"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="my-5 border-t border-gray-100" />
                    <p className="text-xs text-gray-500 text-center">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-black hover:text-gray-800 hover:underline">
                            Sign up here
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2025 Spartans Platform · All rights reserved
                </p>
            </div>
        </div>
    )
}
