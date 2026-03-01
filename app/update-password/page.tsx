'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateInitialPassword } from '@/app/actions/update-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const { currentUser } = useAppStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return
        }

        setIsSubmitting(true)

        try {
            await updateInitialPassword(password)
            toast.success('Password updated successfully!')

            // Give Supabase a moment to sync the new auth state before hard redirecting
            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 500)
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen grid items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome to Spartans!</CardTitle>
                    <CardDescription>
                        For security reasons, you must set a permanent password before accessing the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                disabled={isSubmitting}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Password...
                                </>
                            ) : (
                                'Set Password & Continue'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
