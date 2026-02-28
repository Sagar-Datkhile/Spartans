'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'MANAGER',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'EMPLOYEE',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'EMPLOYEE',
    status: 'inactive',
  },
]

const getRoleColor = (role: string) => {
  switch (role) {
    case 'SUPERADMIN':
      return 'bg-red-500'
    case 'MANAGER':
      return 'bg-blue-500'
    case 'EMPLOYEE':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusColor = (status: string) => {
  return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}

export default function UserManagement() {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-3">
      {mockUsers.map((user) => (
        <Card key={user.id}>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className={`${getRoleColor(user.role)} text-white`}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              <Badge className={getStatusColor(user.status)}>
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>

              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
