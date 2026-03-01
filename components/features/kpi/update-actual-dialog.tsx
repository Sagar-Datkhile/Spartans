'use client'

import { useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, BarChart2 } from 'lucide-react'
import { KPIScore, calculateKPIScore, getKPIStatus, getStatusColor } from '@/lib/services/kpi'

interface UpdateActualDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kpi: KPIScore
    onSuccess?: () => void
}

export default function UpdateActualDialog({ open, onOpenChange, kpi, onSuccess }: UpdateActualDialogProps) {
    const [actual, setActual] = useState<string>(kpi.actual_value?.toString() ?? '')
    const [loading, setLoading] = useState(false)

    // Live preview
    const numActual = parseFloat(actual)
    const previewScore = !isNaN(numActual) && numActual >= 0
        ? calculateKPIScore(numActual, kpi.target_value)
        : null
    const previewStatus = previewScore != null ? getKPIStatus(previewScore) : null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isNaN(numActual) || numActual < 0) {
            toast.error('Please enter a valid number')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/kpi', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: kpi.id, actual_value: numActual }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Update failed')
            toast.success('KPI updated!')
            onOpenChange(false)
            onSuccess?.()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Enter Actual Value</DialogTitle>
                            <DialogDescription>{kpi.metric_name} · Period: {kpi.period}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="rounded-lg bg-muted/50 p-3 flex justify-between text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-semibold">{kpi.target_value}</span>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="actual">Actual Achieved Value <span className="text-red-500">*</span></Label>
                        <Input
                            id="actual"
                            type="number"
                            min={0}
                            step="any"
                            placeholder="Enter actual value…"
                            value={actual}
                            onChange={(e) => setActual(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Live preview */}
                    {previewScore != null && (
                        <div className="rounded-lg border p-3 space-y-2 bg-card">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">KPI Score</span>
                                <span className="text-2xl font-bold">{previewScore.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(previewStatus)}`}>
                                    {previewStatus}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(previewScore, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
