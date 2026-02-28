import { useEffect, useState } from 'react'
import { getProjectsByCompany } from '@/lib/services/firestore'
import { Project } from '@/lib/models'

export function useProjects(companyId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await getProjectsByCompany(companyId)
        setProjects(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [companyId])

  return { projects, loading, error }
}
