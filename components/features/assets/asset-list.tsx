'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const mockAssets = [
  {
    id: '1',
    name: 'Dell Laptop',
    type: 'Hardware',
    status: 'IN_USE',
    currentUser: 'John Doe',
    value: '$1,200',
  },
  {
    id: '2',
    name: 'Office Chair',
    type: 'Furniture',
    status: 'IN_USE',
    currentUser: 'Jane Smith',
    value: '$400',
  },
  {
    id: '3',
    name: 'Monitor',
    type: 'Hardware',
    status: 'AVAILABLE',
    currentUser: null,
    value: '$350',
  },
]

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

export default function AssetList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockAssets.map((asset) => (
        <Card key={asset.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{asset.name}</CardTitle>
              <Badge className={getStatusColor(asset.status)}>
                {asset.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-semibold">{asset.type}</p>
            </div>

            {asset.currentUser && (
              <div>
                <p className="text-sm text-muted-foreground">Current User</p>
                <p className="font-semibold">{asset.currentUser}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Value</p>
              <p className="font-semibold">{asset.value}</p>
            </div>

            <Button variant="outline" className="w-full">
              Manage
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
