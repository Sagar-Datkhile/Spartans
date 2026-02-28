import { useEffect, useState } from 'react'
import { getAssetsByCompany } from '@/lib/services/firestore'
import { Asset } from '@/lib/models'

export function useAssets(companyId: string | undefined) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return
    }

    const fetchAssets = async () => {
      try {
        setLoading(true)
        const data = await getAssetsByCompany(companyId)
        setAssets(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assets')
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [companyId])

  return { assets, loading, error }
}
