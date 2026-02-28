'use client'

import { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { Loader2, Upload, CheckCircle2, XCircle, Download, FileSpreadsheet } from 'lucide-react'
import { parseUserCSV, validateUserCSVRow, downloadCSVTemplate, UserCSVRow } from '@/lib/utils/csv'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface BulkInviteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

type RowWithStatus = UserCSVRow & { valid: boolean; errors: string[]; sent?: boolean; failed?: string }

export default function BulkInviteDialog({ open, onOpenChange, onSuccess }: BulkInviteDialogProps) {
    const { currentUser } = useAppStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [rows, setRows] = useState<RowWithStatus[]>([])
    const [stage, setStage] = useState<'upload' | 'preview' | 'sending' | 'done'>('upload')
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState<{ email: string; success: boolean; error?: string }[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (ev) => {
            const content = ev.target?.result as string
            const parsed = parseUserCSV(content)
            const withValidation = parsed.map((row) => {
                const { valid, errors } = validateUserCSVRow(row)
                return { ...row, valid, errors }
            })
            setRows(withValidation)
            setStage('preview')
        }
        reader.readAsText(file)
    }

    const handleSend = async () => {
        const validRows = rows.filter((r) => r.valid)
        if (validRows.length === 0) return

        setStage('sending')
        setProgress(0)

        const res = await fetch('/api/users/bulk-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                users: validRows.map(({ email, name, role, phone }) => ({ email, name, role, phone })),
                companyId: currentUser?.companyId || 'company-1',
                createdBy: currentUser?.id,
            }),
        })

        // Simulate progress animation
        for (let i = 10; i <= 90; i += 10) {
            await new Promise((r) => setTimeout(r, 200))
            setProgress(i)
        }

        const data = await res.json()
        setProgress(100)
        setResults(data.results || [])
        setStage('done')

        if (data.invited > 0) {
            toast.success(`${data.invited} invite(s) sent successfully`)
            onSuccess?.()
        }
        if (data.failed > 0) {
            toast.error(`${data.failed} invite(s) failed`)
        }
    }

    const handleClose = () => {
        setRows([])
        setStage('upload')
        setProgress(0)
        setResults([])
        if (fileInputRef.current) fileInputRef.current.value = ''
        onOpenChange(false)
    }

    const validCount = rows.filter((r) => r.valid).length
    const invalidCount = rows.filter((r) => !r.valid).length

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Invite via CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to invite multiple users at once. Each user will receive an email to set their
                        password.
                    </DialogDescription>
                </DialogHeader>

                {/* STAGE: Upload */}
                {stage === 'upload' && (
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm font-medium">Click to upload your CSV file</p>
                            <p className="text-xs text-muted-foreground">Required columns: email, name, role</p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                Not sure of the format?
                            </p>
                            <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
                                <Download className="mr-2 h-3 w-3" />
                                Download Template
                            </Button>
                        </div>
                    </div>
                )}

                {/* STAGE: Preview */}
                {stage === 'preview' && (
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {validCount} valid
                            </Badge>
                            {invalidCount > 0 && (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    {invalidCount} invalid (will be skipped)
                                </Badge>
                            )}
                        </div>

                        <div className="rounded-lg border overflow-hidden max-h-72 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, i) => (
                                        <TableRow key={i} className={!row.valid ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{row.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {row.valid ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <span className="text-xs text-red-500">{row.errors.join(', ')}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => { setRows([]); setStage('upload') }}>
                                Re-upload
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={validCount === 0}
                                onClick={handleSend}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Send {validCount} Invite{validCount !== 1 ? 's' : ''}
                            </Button>
                        </div>
                    </div>
                )}

                {/* STAGE: Sending */}
                {stage === 'sending' && (
                    <div className="flex flex-col items-center gap-6 py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <div className="w-full space-y-2">
                            <p className="text-sm text-center text-muted-foreground">Sending invites...</p>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>
                )}

                {/* STAGE: Done */}
                {stage === 'done' && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-2 py-4 text-center">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                            <p className="font-semibold">All done!</p>
                        </div>

                        <div className="rounded-lg border overflow-hidden max-h-64 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Result</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{r.email}</TableCell>
                                            <TableCell>
                                                {r.success ? (
                                                    <Badge className="bg-green-100 text-green-800">Invite Sent</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800">{r.error || 'Failed'}</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <Button className="w-full" onClick={handleClose}>
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
