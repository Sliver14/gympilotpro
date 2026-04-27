import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCurrentUser } from '@/lib/auth'
import { Shield, Settings as SettingsIcon, Mail, User } from 'lucide-react'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500">Manage your SaaS administrator account and global platform configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <CardTitle>My Account</CardTitle>
            </div>
            <CardDescription>Your personal administrator profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={`${user.firstName} ${user.lastName}`} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex gap-2">
                <Input value={user.email} disabled className="flex-1" />
                <Button variant="outline" size="icon">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-100 rounded-md text-orange-700">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">Update Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-gray-600" />
              <CardTitle>Platform Configuration</CardTitle>
            </div>
            <CardDescription>Global settings for GymPilotPro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input defaultValue="GymPilotPro" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@gympilotpro.com" />
            </div>
            <div className="space-y-2">
              <Label>Maintenance Mode</Label>
              <div className="flex items-center justify-between p-3 border rounded-md">
                <span className="text-sm">Disable new gym registrations</span>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
            <Button variant="secondary" className="w-full">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
