'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUser } from '@/lib/services/firestore'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const { setCurrentUser } = useAppStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Sign in with Firebase Auth
            const credential = await signInWithEmailAndPassword(auth, email, password)
            const uid = credential.user.uid

            // Load user profile from Firestore
            const profile = await getUser(uid)
            if (!profile) {
                setError('Your account profile was not found. Please contact your administrator.')
                await auth.signOut()
                setLoading(false)
                return
            }

            // Store in Zustand
            setCurrentUser({
                id: uid,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                avatar: profile.avatar,
                companyId: profile.companyId,
                departmentId: profile.departmentId,
                createdAt: profile.createdAt.toDate(),
                updatedAt: profile.updatedAt.toDate(),
            })

            // Mark user as active on first login
            if (profile.status === 'pending') {
                const { updateUser } = await import('@/lib/services/firestore')
                await updateUser(uid, { status: 'active' })
            }

            router.push('/dashboard')
        } catch (err: any) {
            console.error(err)
            if (
                err.code === 'auth/invalid-credential' ||
                err.code === 'auth/wrong-password' ||
                err.code === 'auth/user-not-found'
            ) {
                setError('Invalid email or password.')
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.')
            } else {
                setError('Login failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo / Brand */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Spartans</h1>
                    <p className="text-slate-400 text-sm">Enterprise Performance Management</p>
                </div>

                {/* Card */}
                <Card className="border-slate-700 bg-slate-800/60 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl text-white">Sign in to your account</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter your credentials to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <p className="mt-4 text-center text-xs text-slate-500">
                            Don&apos;t have an account? Contact your administrator to get an invite.
                        </p>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-600">
                    © 2025 Spartans Platform · All rights reserved
                </p>
            </div>
        </div>
    )
}
