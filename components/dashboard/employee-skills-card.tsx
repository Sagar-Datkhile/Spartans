'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sparkles, Save } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export default function EmployeeSkillsCard() {
    const { currentUser, setCurrentUser } = useAppStore()

    const [skills, setSkills] = useState('')
    const [capacity, setCapacity] = useState('40')

    // Initialize from currentUser data if it exists
    useEffect(() => {
        if (currentUser) {
            if (currentUser.skills) {
                setSkills(currentUser.skills.join(', '))
            }
            if (currentUser.baseCapacityHours) {
                setCapacity(currentUser.baseCapacityHours.toString())
            }
        }
    }, [currentUser])

    const handleSave = () => {
        if (!currentUser) return

        const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)
        const capacityNum = Number(capacity) || 40

        // Update local store so the UI reflects globally
        // We will sync this to Firebase in a future update
        setCurrentUser({
            ...currentUser,
            skills: skillsArray,
            baseCapacityHours: capacityNum
        } as any)

        toast.success('Profile Updated Local State', {
            description: 'Your skills and availability have been saved for this session.',
        })
    }

    return (
        <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-indigo-500" />
            </div>

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                    AI Workload Profile
                </CardTitle>
                <CardDescription>
                    Keep your skills and availability updated so the AI can route the best tasks to you.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
                <div className="space-y-2">
                    <Label htmlFor="skills">My Core Skills (comma separated)</Label>
                    <Input
                        id="skills"
                        placeholder="e.g. React, Node.js, UI Design"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="focus-visible:ring-indigo-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="capacity">Weekly Capacity (Hours)</Label>
                    <Input
                        id="capacity"
                        type="number"
                        min="1"
                        max="80"
                        placeholder="e.g. 40"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="focus-visible:ring-indigo-500 w-full md:w-1/3"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                        How many hours per week do you dedicate to project tasks? The AI uses this to prevent burnout.
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile Locally
                </Button>
            </CardContent>
        </Card>
    )
}
