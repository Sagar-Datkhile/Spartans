import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="mb-6 rounded-full bg-red-100 p-4 shadow-sm">
                <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">Access Denied</h1>
            <p className="mb-8 max-w-sm text-sm text-gray-500">
                You don't have permission to access this area. If you believe this is a mistake, please contact your SuperAdmin.
            </p>
            <Link href="/dashboard" passHref>
                <Button>Return to Dashboard</Button>
            </Link>
        </div>
    )
}
