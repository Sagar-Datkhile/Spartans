'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AssetList from '@/components/features/assets/asset-list'
import CreateAssetDialog from '@/components/features/assets/create-asset-dialog'

export default function AssetsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Manage company assets and resources</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Asset
        </Button>
      </div>

      <AssetList refreshKey={refreshKey} />

      <CreateAssetDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
    </div>
  )
}
