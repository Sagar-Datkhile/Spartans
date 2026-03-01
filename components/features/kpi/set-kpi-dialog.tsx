'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Target } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const schema = z.object({
    employee_id: z.string().min(1, 'Select an employee'),
    metric_name: z.string().min(2, 'Metric name is required'),
    target_value: z.coerce.number().positive('Target must be positive'),
    period: z.string().min(1, 'Period is required'),
    notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SetKPIDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    employees: { id: string; name: string }[]
    onSuccess?: () => void
}

// Build the last 6 months as period options (YYYY-MM)
function getPeriodOptions() {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleString('default', { month: 'long', year: 'numeric' })
        options.push({ value, label })
    }
    return options
}

export default function SetKPIDialog({ open, onOpenChange, employees, onSuccess }: SetKPIDialogProps) {
    const { currentUser } = useAppStore()
    const [loading, setLoading] = useState(false)
    const periodOptions = getPeriodOptions()

    const {
        register, handleSubmit, setValue, watch, reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { period: periodOptions[0].value },
    })

    const onSubmit = async (values: FormValues) => {
        if (!currentUser) return
        setLoading(true)
        try {
            const res = await fetch('/api/kpi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    manager_id: currentUser.id,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create KPI')
            toast.success('KPI target set successfully!')
            reset()
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Set KPI Target</DialogTitle>
                            <DialogDescription>Define a KPI metric and target for an employee.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    {/* Employee */}
                    <div className="space-y-1.5">
                        <Label>Employee <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => setValue('employee_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee…" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((e) => (
                                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.employee_id && <p className="text-xs text-red-500">{errors.employee_id.message}</p>}
                    </div>

                    {/* Metric Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="metric_name">Metric Name <span className="text-red-500">*</span></Label>
                        <Input id="metric_name" placeholder="e.g. Tasks Completed, Sales Calls…" {...register('metric_name')} />
                        {errors.metric_name && <p className="text-xs text-red-500">{errors.metric_name.message}</p>}
                    </div>

                    {/* Target Value */}
                    <div className="space-y-1.5">
                        <Label htmlFor="target_value">Target Value <span className="text-red-500">*</span></Label>
                        <Input id="target_value" type="number" min={1} placeholder="e.g. 100" {...register('target_value')} />
                        {errors.target_value && <p className="text-xs text-red-500">{errors.target_value.message}</p>}
                    </div>

                    {/* Period */}
                    <div className="space-y-1.5">
                        <Label>Period <span className="text-red-500">*</span></Label>
                        <Select
                            defaultValue={periodOptions[0].value}
                            onValueChange={(v) => setValue('period', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {periodOptions.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea id="notes" placeholder="Additional context or instructions…" rows={2} {...register('notes')} />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Set KPI Target
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
