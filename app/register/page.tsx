'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form states
    const [inviteData, setInviteData] = useState<{ id: string; email: string; name: string } | null>(null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 1. Validate token on mount
    useEffect(() => {
        if (!token) {
            setError('No invitation token found in the URL. Please check your email link.')
            setLoading(false)
            return
        }

        async function validateToken() {
            try {
                // Fetch the pending invite from public.invites with this token
                const supabase = createClient()
                const { data: invite, error: fetchErr } = await supabase
                    .from('invites')
                    .select('id, email, name, expires_at, status')
                    .eq('token', token)
                    .single()

                if (fetchErr || !invite) {
                    setError('Invalid or expired invitation token.')
                    return
                }

                // Check expiration
                if (new Date(invite.expires_at) < new Date()) {
                    setError('This invitation has expired (24 hours limit). Please request a new invite.')
                    return
                }

                if (invite.status === 'completed') {
                    setError('This account has already been registered and activated.')
                    return
                }

                setInviteData(invite)
            } catch (err: any) {
                setError('An unexpected error prevented token validation.')
            } finally {
                setLoading(false)
            }
        }

        validateToken()
    }, [token])

    // 2. Handle final registration
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (!inviteData || !token) return

        setSubmitting(true)

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    email: inviteData.email,
                    password,
                    pendingId: inviteData.id
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to complete registration')

            setSuccess(true)

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error && !inviteData) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50/50">
                <Card className="max-w-md shadow-lg border-red-100 p-4">
                    <CardHeader className="items-center pb-2">
                        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                        <CardTitle className="text-xl">Invalid Invitation</CardTitle>
                        <CardDescription className="text-center">{error}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pt-4">
                        <Button variant="outline" onClick={() => router.push('/login')}>Go to Login</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F9FAFB] p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
                    <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                </div>

                <Card className="w-full max-w-[450px] shadow-2xl border-none overflow-hidden bg-white/80 backdrop-blur-xl">
                    <div className="h-2 w-full bg-emerald-500 animate-in slide-in-from-left duration-1000" />
                    <CardHeader className="pt-10 pb-6 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                            <CheckCircle2 className="h-10 w-10 fill-emerald-100" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">Registration Complete!</CardTitle>
                        <CardDescription className="text-base text-gray-500 mt-2 px-4 leading-relaxed">
                            Congratulations! Your account has been successfully activated. You can now access your Spartans dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8 space-y-6">
                        <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Redirecting to login...</span>
                                <span className="font-mono font-bold text-primary">3s</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-[loading_3s_linear]" />
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => router.push('/login')}
                        >
                            Log in to your account
                        </Button>
                    </CardContent>
                </Card>

                <p className="mt-8 text-sm text-gray-400 font-medium">
                    Welcome to the Spartans ecosystem.
                </p>
                <style jsx>{`
                    @keyframes loading {
                        from { width: 0%; }
                        to { width: 100%; }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F9FAFB] p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-[450px] shadow-2xl border-none bg-white/90 backdrop-blur-xl relative z-10">
                <div className="h-1.5 w-full bg-black rounded-t-xl" />
                <CardHeader className="pt-10 pb-6 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white transform -rotate-6 shadow-xl">
                        <span className="text-2xl font-bold italic">S</span>
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">Complete Profile</CardTitle>
                    <CardDescription className="text-base text-gray-500 mt-2 px-6">
                        Welcome, <span className="font-bold text-gray-900">{inviteData?.name}</span>.
                        Please secure your account by setting a new password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={inviteData?.email}
                                disabled
                                className="h-12 bg-gray-50 border-gray-200 text-gray-500 font-medium cursor-not-allowed rounded-xl"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="password" title="At least 6 characters" className="text-xs font-bold uppercase tracking-widest text-gray-400">Create Password</Label>
                                <div className="relative group">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="········"
                                        required
                                        className="h-12 border-gray-200 focus:border-black focus:ring-0 transition-all rounded-xl pl-4 pr-12 text-lg"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-black hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <Label htmlFor="confirm-password" title="Must match" className="text-xs font-bold uppercase tracking-widest text-gray-400">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="········"
                                    required
                                    className="h-12 border-gray-200 focus:border-black focus:ring-0 transition-all rounded-xl pl-4 text-lg"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-xl"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Activating Account...</span>
                                </div>
                            ) : (
                                'Activate My Account'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-sm text-gray-400 font-medium">
                © 2026 Spartans Platform · Enterprise Performance
            </p>
        </div>
    )
}
