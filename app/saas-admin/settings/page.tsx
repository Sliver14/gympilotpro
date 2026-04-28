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
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Platform Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your SaaS administrator account and global platform configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-zinc-100">My Account</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Your personal administrator profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Full Name</Label>
              <Input value={`${user.firstName} ${user.lastName}`} disabled className="bg-zinc-900 border-zinc-800 text-zinc-400 opacity-70" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Email Address</Label>
              <div className="flex gap-2">
                <Input value={user.email} disabled className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-400 opacity-70" />
                <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" disabled>
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Role</Label>
              <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-md text-orange-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0">Update Profile</Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-zinc-400" />
              <CardTitle className="text-zinc-100">Platform Configuration</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Global settings for GymPilotPro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Platform Name</Label>
              <Input defaultValue="GymPilotPro" className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Support Email</Label>
              <Input defaultValue="support@gympilotpro.com" className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Maintenance Mode</Label>
              <div className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-900/50 rounded-md">
                <span className="text-sm text-zinc-300">Disable new gym registrations</span>
                <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">Enable</Button>
              </div>
            </div>
            <Button variant="secondary" className="w-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
