'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Smile } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface SetStatusDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const PRESET_STATUSES = [
    { emoji: '🗓️', text: 'In a meeting', duration: '1 hour' },
    { emoji: '🚌', text: 'Commuting', duration: '30 minutes' },
    { emoji: '🤒', text: 'Out sick', duration: 'Today' },
    { emoji: '🌴', text: 'Vacationing', duration: 'Don\'t clear' },
    { emoji: '🏡', text: 'Working remotely', duration: 'Today' },
]

export default function SetStatusDialog({ open, onOpenChange }: SetStatusDialogProps) {
    const { currentUser, updateEmployeeStatus } = useAppStore()
    const [selectedStatus, setSelectedStatus] = useState<{ emoji: string; text: string; duration?: string } | null>(
        currentUser?.status || null
    )
    const [customText, setCustomText] = useState('')

    const handleSave = () => {
        if (currentUser) {
            if (customText) {
                // Just use a default smile emoji for custom text if they didn't pick from presets
                // but for simplicity, the prompt says "keep their content same"
                updateEmployeeStatus(currentUser.id, { emoji: '😊', text: customText, duration: 'Until cleared' })
            } else {
                updateEmployeeStatus(currentUser.id, selectedStatus)
            }
        }
        onOpenChange(false)
    }

    const handleClear = () => {
        if (currentUser) {
            updateEmployeeStatus(currentUser.id, null)
        }
        setSelectedStatus(null)
        setCustomText('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 border-slate-800 bg-[#1e1e1e] text-slate-200">
                <DialogHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-xl font-semibold text-white">Set a status</DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Smile className="h-5 w-5 text-slate-400" />
                        </div>
                        <Input
                            value={customText}
                            onChange={(e) => {
                                setCustomText(e.target.value)
                                setSelectedStatus(null)
                            }}
                            placeholder="What's your status?"
                            className="pl-10 bg-[#2b2b2b] border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-500 h-12"
                        />
                    </div>

                    <div>
                        <div className="text-sm font-medium text-slate-400 mb-3 px-2">
                            For {currentUser?.name || 'User'}
                        </div>
                        <div className="space-y-1">
                            {PRESET_STATUSES.map((status, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedStatus({ emoji: status.emoji, text: status.text, duration: status.duration })
                                        setCustomText('')
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${selectedStatus?.text === status.text && !customText
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'hover:bg-[#2b2b2b] text-slate-200 hover:text-white'
                                        }`}
                                >
                                    <span className="text-lg leading-none">{status.emoji}</span>
                                    <span className="font-medium">{status.text}</span>
                                    <span className={
                                        selectedStatus?.text === status.text && !customText
                                            ? 'text-blue-100'
                                            : 'text-slate-400'
                                    }>— {status.duration}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-slate-400 mb-3 px-2">
                            Automatically updates
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-200">
                            <div className="bg-blue-500 rounded text-xs px-1.5 py-1 text-white font-medium shadow-sm flex flex-col items-center justify-center leading-none">
                                <span className="text-[9px] uppercase font-bold opacity-90 border-b border-white/20 pb-0.5 w-full text-center">31</span>
                            </div>
                            <span className="font-medium">In a meeting</span>
                            <span className="text-slate-400">— Based on your Google Calendar</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                        onClick={() => {
                            setSelectedStatus(null);
                            setCustomText('');
                        }}
                        className="text-sm text-blue-400 hover:underline"
                    >
                        Clear status
                    </button>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800 text-white hover:text-white" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
