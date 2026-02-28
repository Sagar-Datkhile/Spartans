'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  User, Lock, Bell, Building2, ShieldCheck, Settings2,
  Globe, CreditCard, Users, Clock, Smartphone
} from 'lucide-react'

/* ─── Shared sections available to all roles ─── */

function ProfileSection() {
  const { currentUser } = useAppStore()
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </CardTitle>
          <CardDescription>Update your name, photo, and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" defaultValue={currentUser?.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-display">Email Address</Label>
              <Input id="email-display" defaultValue={currentUser?.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" placeholder="e.g. Asia/Kolkata" />
            </div>
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AccountSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </CardTitle>
          <CardDescription>Update your login password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="Enter current password" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="Min. 8 characters" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="Re-enter new password" />
            </div>
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Authenticator App</p>
              <p className="text-xs text-muted-foreground">Use Google Authenticator or similar apps.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notification Preferences
        </CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: 'Task Assigned', desc: 'When a task is assigned to you', defaultOn: true },
          { label: 'Task Due Soon', desc: '24 hours before a task deadline', defaultOn: true },
          { label: 'Project Updates', desc: 'When a project you\'re in is updated', defaultOn: false },
          { label: 'Chat Messages', desc: 'New messages in your chats', defaultOn: true },
          { label: 'Weekly Summary', desc: 'A weekly digest of your activity', defaultOn: false },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultOn} />
            </div>
            <Separator className="mt-3" />
          </div>
        ))}
        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}

/* ─── MANAGER-only section ─── */

function TeamSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Team Preferences
          </CardTitle>
          <CardDescription>Configure settings for your team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Team / Department Name</Label>
              <Input id="team-name" placeholder="e.g. Engineering Team" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-size">Max Team Size</Label>
              <Input id="team-size" type="number" placeholder="10" />
            </div>
          </div>
          <Button>Save Team Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Working Hours
          </CardTitle>
          <CardDescription>Set default working hours for your team members.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="time" defaultValue="09:00" />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input type="time" defaultValue="18:00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="flex gap-2 flex-wrap">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <button
                  key={day}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${i < 5
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border'
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <Button>Save Hours</Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── SUPERADMIN-only sections ─── */

function CompanySection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Company Information
          </CardTitle>
          <CardDescription>Update your organisation's details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Spartans Inc." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="e.g. Technology" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="website">
                <Globe className="inline h-3 w-3 mr-1" />Website
              </Label>
              <Input id="website" placeholder="https://yourcompany.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="e.g. India" />
            </div>
          </div>
          <Button>Save Company Info</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SystemSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> System Limits
          </CardTitle>
          <CardDescription>Configure platform-wide resource limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="max-projects">Max Projects</Label>
              <Input id="max-projects" type="number" placeholder="100" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-users">Max Users</Label>
              <Input id="max-users" type="number" placeholder="500" />
            </div>
          </div>
          <Button>Save System Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Security Settings
          </CardTitle>
          <CardDescription>Platform-wide security configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Require 2FA for Admins', desc: 'Force all Super Admins to use two-factor authentication', on: true },
            { label: 'Session Timeout', desc: 'Auto log-out after 30 minutes of inactivity', on: false },
            { label: 'Audit Logging', desc: 'Log all user actions for compliance', on: true },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.on} />
              </div>
              <Separator className="mt-3" />
            </div>
          ))}
          <Button>Save Security Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function BillingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Plan & Billing
        </CardTitle>
        <CardDescription>Manage your subscription and billing details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-semibold">Professional Plan</p>
            <p className="text-sm text-muted-foreground">Up to 500 users · Unlimited projects</p>
          </div>
          <Badge className="bg-green-500 text-white">Active</Badge>
        </div>
        <div className="grid grid-cols-3 text-center gap-4">
          {[
            { label: 'Users', value: '24 / 500' },
            { label: 'Projects', value: '12 / ∞' },
            { label: 'Next Billing', value: 'Apr 1, 2026' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg border p-3">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <Button variant="outline">Manage Subscription</Button>
      </CardContent>
    </Card>
  )
}

/* ─── Main Settings Page ─── */

export default function SettingsPage() {
  const { currentUser } = useAppStore()
  const role = currentUser?.role ?? 'EMPLOYEE'

  /* Tab sets per role */
  const superAdminTabs = [
    { value: 'profile', label: 'Profile', icon: User, content: <ProfileSection /> },
    { value: 'account', label: 'Account', icon: Lock, content: <AccountSection /> },
    { value: 'notifications', label: 'Notifications', icon: Bell, content: <NotificationsSection /> },
    { value: 'company', label: 'Company', icon: Building2, content: <CompanySection /> },
    { value: 'system', label: 'System', icon: Settings2, content: <SystemSection /> },
    { value: 'billing', label: 'Billing', icon: CreditCard, content: <BillingSection /> },
  ]

  const managerTabs = [
    { value: 'profile', label: 'Profile', icon: User, content: <ProfileSection /> },
    { value: 'account', label: 'Account', icon: Lock, content: <AccountSection /> },
    { value: 'notifications', label: 'Notifications', icon: Bell, content: <NotificationsSection /> },
    { value: 'team', label: 'Team', icon: Users, content: <TeamSection /> },
  ]

  const employeeTabs = [
    { value: 'profile', label: 'Profile', icon: User, content: <ProfileSection /> },
    { value: 'account', label: 'Account', icon: Lock, content: <AccountSection /> },
    { value: 'notifications', label: 'Notifications', icon: Bell, content: <NotificationsSection /> },
  ]

  const tabs =
    role === 'SUPERADMIN' ? superAdminTabs
      : role === 'MANAGER' ? managerTabs
        : employeeTabs

  const roleMeta = {
    SUPERADMIN: { label: 'Super Admin', color: 'bg-red-500' },
    MANAGER: { label: 'Manager', color: 'bg-blue-500' },
    EMPLOYEE: { label: 'Employee', color: 'bg-green-500' },
  }[role]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            {role === 'SUPERADMIN' && 'Manage your profile, company, system, and billing settings.'}
            {role === 'MANAGER' && 'Manage your profile, account, and team settings.'}
            {role === 'EMPLOYEE' && 'Manage your personal profile and account settings.'}
          </p>
        </div>
        <Badge className={`${roleMeta.color} text-white`}>{roleMeta.label}</Badge>
      </div>

      {/* Role-aware Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-2">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
