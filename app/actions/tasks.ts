'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTasks() {
    const supabase = await createClient()

    // Grab session explicitly to ensure user is handled securely
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
        throw new Error('Unauthorized')
    }

    // Fetch tasks
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
      id,
      title,
      description,
      status,
      priority,
      project_name,
      due_date,
      created_at,
      assignee_id
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tasks:', error)
        throw new Error('Failed to fetch tasks')
    }

    // To match the UI requirements, we can fetch user names if needed, 
    // but for now we will rely on returning the tasks. 
    // Normally you'd join with the public.users table or fetch profiles.

    // Here we'll do a basic fetch of profiles to map assignee_id to names manually to avoid complex joins right now.
    const { data: profiles } = await supabase.from('users').select('id, name')
    const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || [])

    const enrichedTasks = tasks.map(task => ({
        ...task,
        assignee: profileMap.get(task.assignee_id) || 'Unassigned',
        completed: task.status === 'COMPLETED'
    }))

    return enrichedTasks
}

export async function getEmployees() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return []

    // Assumes users table has role column, we fetch all users or just employees. 
    // If no role column exists or we just want everyone, omit the .eq('role', 'EMPLOYEE')
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email')
    // .eq('role', 'EMPLOYEE') // Optional filter depending on schema

    if (error) {
        console.error('Error fetching employees:', error)
        return []
    }

    return users
}

export async function getProjects() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return []

    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name')

    if (error) {
        console.error('Error fetching projects:', error)
        return []
    }

    return projects
}

export async function createTask(formData: FormData) {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string || 'TODO'
    const priority = formData.get('priority') as string || 'MEDIUM'
    const projectName = formData.get('project') as string
    const assigneeId = formData.get('assignee') as string // UUID
    const dueDate = formData.get('dueDate') as string

    // Simple validation
    if (!title) {
        throw new Error('Title is required')
    }

    const { error } = await supabase
        .from('tasks')
        .insert([
            {
                title,
                description,
                status,
                priority,
                project_name: projectName,
                assignee_id: assigneeId || session.user.id, // fallback to self
                due_date: dueDate || null
            }
        ])

    if (error) {
        console.error('Error creating task:', error)
        throw new Error('Failed to create task')
    }

    // Revalidate the caching so the tasks page hot reloads data
    revalidatePath('/dashboard/tasks')
}

export async function updateTaskStatus(taskId: string, status: string) {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)

    if (error) {
        console.error('Error updating task status:', error)
        throw new Error('Failed to update task status')
    }

    revalidatePath('/dashboard/tasks')
}
