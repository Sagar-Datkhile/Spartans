'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'
import ManageAssetDialog from './manage-asset-dialog'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-500'
    case 'IN_USE':
      return 'bg-blue-500'
    case 'MAINTENANCE':
      return 'bg-yellow-500'
    case 'RETIRED':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export default function AssetList({ refreshKey }: { refreshKey?: number }) {
  const { currentUser } = useAppStore()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)

  const fetchAssets = async () => {
    if (!currentUser?.companyId) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('assets')
      .select(`
        *,
        users!assets_current_user_id_fkey ( name )
      `)
      .eq('company_id', currentUser.companyId)
      .order('created_at', { ascending: false })

    if (data) {
      setAssets(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAssets()
  }, [currentUser?.companyId, refreshKey])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-card/50 border-dashed">
        <h3 className="text-lg font-medium text-foreground mb-1">No assets found</h3>
        <p className="text-muted-foreground text-sm">Add a new asset to your directory.</p>
      </div>
    )
  }

  const handleManage = (asset: any) => {
    setSelectedAsset(asset)
    setManageDialogOpen(true)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.id} className="transition-all hover:border-blue-400 hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg pr-3 leading-tight">{asset.name}</CardTitle>
              <Badge className={getStatusColor(asset.status)}>
                {asset.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-semibold">{asset.type}</p>
            </div>

            {asset.users?.name && (
              <div>
                <p className="text-xs text-muted-foreground">Current User</p>
                <div className="font-semibold text-blue-600 bg-blue-50 w-fit px-2 rounded mt-1">
                  {asset.users.name}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground">Value</p>
              <p className="font-semibold">${Number(asset.value || 0).toLocaleString()}</p>
            </div>

            <Button variant="outline" className="w-full mt-2" onClick={() => handleManage(asset)}>
              Manage / Assign
            </Button>
          </CardContent>
        </Card>
      ))}

      {selectedAsset && (
        <ManageAssetDialog
          open={manageDialogOpen}
          asset={selectedAsset}
          onOpenChange={setManageDialogOpen}
          onSuccess={() => {
            setManageDialogOpen(false)
            fetchAssets()
          }}
        />
      )}
    </div>
  )
}
