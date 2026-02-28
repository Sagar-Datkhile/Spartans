'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'
import { downloadCSVTemplate } from '@/lib/utils/csv'
import RoleGuard from '@/components/auth/role-guard'

export default function AdminPanel() {
  return (
    <RoleGuard requiredFeature="user_management">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,250</div>
                <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">342</div>
                <p className="text-xs text-muted-foreground mt-1">Right now</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground mt-1">Uptime</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">45%</div>
                <p className="text-xs text-muted-foreground mt-1">of total capacity</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulk User Import</CardTitle>
                  <CardDescription>Import users from CSV file</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCSVTemplate}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-2">
                  Drag and drop your CSV file here or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV should contain: email, name, role, department, phone
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions Matrix</CardTitle>
              <CardDescription>Define what each role can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['SUPERADMIN', 'MANAGER', 'EMPLOYEE'].map((role) => (
                  <div key={role} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={
                        role === 'SUPERADMIN' ? 'bg-red-500' :
                        role === 'MANAGER' ? 'bg-blue-500' : 'bg-green-500'
                      }>
                        {role}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Dashboard', 'Projects', 'Tasks', 'Chat', 'Analytics', 'User Management'].map((perm) => (
                        <label key={perm} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span>{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Track all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { action: 'User Created', user: 'Admin', time: '2 hours ago' },
                  { action: 'Project Updated', user: 'Manager', time: '4 hours ago' },
                  { action: 'Role Changed', user: 'Admin', time: '1 day ago' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <p className="font-semibold">{log.action}</p>
                      <p className="text-muted-foreground">by {log.user}</p>
                    </div>
                    <span className="text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </RoleGuard>
  )
}
