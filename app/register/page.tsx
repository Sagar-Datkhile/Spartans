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
            <div className="flex h-screen items-center justify-center bg-gray-50/50">
                <Card className="max-w-md shadow-lg border-emerald-100 p-4">
                    <CardHeader className="items-center pb-2">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                        <CardTitle className="text-xl">Registration Complete!</CardTitle>
                        <CardDescription className="text-center">Your account is active. Redirecting you to login...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-[400px] shadow-xl border-t-4 border-t-primary">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl text-center">Complete Registration</CardTitle>
                    <CardDescription className="text-center">
                        Welcome {inviteData?.name}! Create a secure password to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={inviteData?.email}
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Set Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Retype password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2 font-medium">
                                <AlertTriangle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-2"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Activating Account...
                                </>
                            ) : (
                                'Complete Registration'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
