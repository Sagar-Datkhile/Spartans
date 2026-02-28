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
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const supabase = createClient()

            // Bypass logic for development if no Supabase URL is set
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || email.includes('dev')) {
                const roleToUse = 'SUPERADMIN'
                setCurrentUser({
                    id: 'dev-user-id',
                    email: email || `${roleToUse.toLowerCase()}@example.com`,
                    name: `Demo ${roleToUse}`,
                    role: roleToUse,
                    companyId: 'dev-company',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                router.push('/dashboard/superadmin')
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

            // Fetch profile data via our server route to bypass RLS
            const profileRes = await fetch('/api/users/me');
            if (!profileRes.ok) {
                await supabase.auth.signOut()
                throw new Error('Account profile not found. Contact your administrator.')
            }

            const { profile } = await profileRes.json();

            setCurrentUser({
                id: authData.user.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                avatar: profile.avatar_url,
                companyId: profile.company_id,
                companyName: profile.company_name,
                departmentId: profile.department_id,
                createdAt: new Date(profile.created_at),
                updatedAt: new Date(profile.updated_at),
            })

            // If account was pending, set it to active
            if (profile.status === 'pending') {
                await supabase.from('users').update({ status: 'active' }).eq('id', profile.id)
            }

            if (profile.role === 'SUPERADMIN') {
                router.push('/dashboard/superadmin')
            } else if (profile.role === 'MANAGER') {
                router.push('/dashboard/manager')
            } else if (profile.role === 'EMPLOYEE') {
                router.push('/dashboard/employee')
            } else {
                router.push('/dashboard')
            }
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
