import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getAISuggestions } from '@/lib/utils/resource-optimizer'
import { UserProfile, Task } from '@/lib/models'

export async function POST(request: NextRequest) {
    try {
        const { projectId, companyId, estimatedHours, requiredSkills, taskTitle } = await request.json()

        if (!projectId || !companyId || !taskTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Fetch Users in the company
        const usersSnapshot = await adminDb.collection('users')
            .where('companyId', '==', companyId)
            .where('status', '==', 'active')
            .get()

        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))

        // 2. Fetch all Active Tasks in the company (to calculate workloads)
        const activeTasksSnapshot = await adminDb.collection('tasks')
            .where('status', 'in', ['TODO', 'IN_PROGRESS', 'IN_REVIEW'])
            // Note: Ideal to filter by companyId if Tasks had it, but we'll fetch all active and filter by our users
            .get()

        const allActiveTasks = activeTasksSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Task))
            .filter(t => users.some(u => u.id === t.assignedTo))

        // 3. Fetch all Completed Tasks (for performance calculation)
        const completedTasksSnapshot = await adminDb.collection('tasks')
            .where('status', '==', 'COMPLETED')
            .get()

        const allCompletedTasks = completedTasksSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Task))
            .filter(t => users.some(u => u.id === t.assignedTo))

        // 4. Run the AI suggestion engine
        const suggestions = await getAISuggestions(
            users,
            allActiveTasks,
            allCompletedTasks,
            estimatedHours || 0,
            requiredSkills || [],
            taskTitle
        )

        return NextResponse.json({ suggestions })

    } catch (error: any) {
        console.error('Error suggesting assignees:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
