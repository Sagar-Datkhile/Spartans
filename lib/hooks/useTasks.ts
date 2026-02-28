import { useEffect, useState } from 'react'
import { getTasksByProject, getTasksByAssignee } from '@/lib/services/firestore'
import { Task } from '@/lib/models'

export function useTasksByProject(projectId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      try {
        setLoading(true)
        const data = await getTasksByProject(projectId)
        setTasks(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [projectId])

  return { tasks, loading, error }
}

export function useTasksByAssignee(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      try {
        setLoading(true)
        const data = await getTasksByAssignee(userId)
        setTasks(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [userId])

  return { tasks, loading, error }
}
