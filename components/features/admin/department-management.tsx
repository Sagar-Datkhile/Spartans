'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const mockDepartments = [
  {
    id: '1',
    name: 'Engineering',
    manager: 'John Doe',
    members: 12,
    status: 'active',
  },
  {
    id: '2',
    name: 'Design',
    manager: 'Jane Smith',
    members: 8,
    status: 'active',
  },
  {
    id: '3',
    name: 'Sales',
    manager: 'Bob Wilson',
    members: 15,
    status: 'active',
  },
]

export default function DepartmentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Manage your organization departments</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDepartments.map((dept) => (
              <div key={dept.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Manager: {dept.manager} • {dept.members} members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                    {dept.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>Add a new department to your organization</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Department Name</Label>
              <Input placeholder="e.g., Engineering" />
            </div>

            <div>
              <Label>Manager</Label>
              <Input placeholder="Select department manager" />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea placeholder="Department description" rows={3} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Create Department</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
