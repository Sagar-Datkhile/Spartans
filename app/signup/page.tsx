'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
    const router = useRouter()
    const { setCurrentUser } = useAppStore()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
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
            setError(err.message || 'Failed to sign up.')
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

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Register Your Organization</h1>
                        <p className="text-sm text-gray-500 mb-6">Create an account for company</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                            <input
                                id="companyName"
                                type="text"
                                placeholder="Acme Corp"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@acmecorp.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
                                minLength={8}
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
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
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating environment...</> : 'Create Company Workspace'}
                        </button>
                    </form>

                    <div className="my-5 border-t border-gray-100" />
                    <p className="text-xs text-gray-500 text-center">
                        Already have an account?{' '}
                        <button type="button" onClick={() => router.push('/login')} className="font-medium text-gray-700 hover:text-black">
                            Sign in here.
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
