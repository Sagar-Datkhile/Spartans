'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Save, User, Briefcase, Mail, Phone, Settings, MapPin, Building2, UserCircle2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface ProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
    const { currentUser, setCurrentUser } = useAppStore()

    const [activeTab, setActiveTab] = useState('general')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [location, setLocation] = useState('San Francisco, CA')
    const [skills, setSkills] = useState('')
    const [capacity, setCapacity] = useState('40')

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '')
            setEmail(currentUser.email || '')
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

        setCurrentUser({
            ...currentUser,
            name,
            skills: skillsArray,
            baseCapacityHours: capacityNum
        } as any)

        toast.success('Profile Updated', {
            description: 'Your profile information has been successfully saved.',
        })
        onOpenChange(false)
    }

    const getInitials = (n: string) => {
        return n.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                {/* Header Banner */}
                <div
                    className="h-32 relative bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop")' }}
                >
                    <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                    <div className="absolute -bottom-12 left-6 border-4 border-card rounded-full bg-card">
                        <Avatar className="w-24 h-24 rounded-full">
                            <AvatarImage src={currentUser?.avatar} />
                            <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground font-semibold">
                                {getInitials(name || 'User')}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {currentUser?.role && (
                        <Badge className={`absolute top-4 right-4 font-semibold shadow-sm border border-white/20 text-white ${currentUser.role === 'SUPERADMIN' ? 'bg-black hover:bg-black/80' :
                            currentUser.role === 'MANAGER' ? 'bg-blue-600 hover:bg-blue-700' :
                                'bg-emerald-600 hover:bg-emerald-700'
                            }`}>
                            {currentUser.role}
                        </Badge>
                    )}
                </div>

                <div className="pt-16 pb-6 px-6">
                    <DialogHeader className="mb-6 space-y-1 text-left">
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            {name || 'User Profile'}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            {currentUser?.role} / UX Engineering
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl">
                            <TabsTrigger value="general" className="rounded-lg transition-all">
                                <UserCircle2 className="w-4 h-4 mr-2" />
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger value="workload" className="rounded-lg transition-all">
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Workload
                            </TabsTrigger>
                        </TabsList>

                        <div className="min-h-[220px]">
                            {/* General Tab */}
                            <TabsContent value="general" className="space-y-4 outline-none focus-visible:ring-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="pl-9 bg-muted/30 focus-visible:bg-transparent transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" value={email} readOnly className="pl-9 bg-muted/50 opacity-70 cursor-not-allowed" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="pl-9 bg-muted/30 focus-visible:bg-transparent transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" className="pl-9 bg-muted/30 focus-visible:bg-transparent transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* AI Workload Tab */}
                            <TabsContent value="workload" className="space-y-4 outline-none focus-visible:ring-0">
                                <div className="space-y-2">
                                    <Label htmlFor="skills" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Core Skills</Label>
                                    <Input
                                        id="skills"
                                        placeholder="React, Node.js, UI/UX"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        className="bg-muted/30 focus-visible:bg-transparent transition-colors"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {skills.split(',').filter(s => s.trim().length > 0).slice(0, 5).map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                {skill.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Weekly Capacity</Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="capacity"
                                                type="number"
                                                min="1"
                                                max="80"
                                                value={capacity}
                                                onChange={(e) => setCapacity(e.target.value)}
                                                className="w-24 bg-muted/30 text-center font-semibold text-lg"
                                            />
                                            <span className="text-sm text-muted-foreground font-medium">Hours / Week</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed mt-2 pr-4">
                                            AI uses this parameter to calculate your bandwidth and evenly distribute tasks to avoid burnout.
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                                            <Sparkles className="w-4 h-4" /> AI Auto-Routing
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Your profile is optimized. Tasks matching your skills will be prioritized for your queue based on capacity.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <Separator className="my-6" />

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all active:scale-[0.98]">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
