'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Shield, Mail, User, Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SettingsClientProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    phoneNumber?: string | null
  }
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Profile state
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [email, setEmail] = useState(user.email)
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: 'Error',
        description: 'First name, last name, and email are required.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/saas-admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phoneNumber }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'All password fields are required.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/saas-admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to change password')

      toast({
        title: 'Success',
        description: 'Password changed successfully.',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-zinc-100">My Account</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Update your personal administrator profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">First Name</Label>
                <Input 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Last Name</Label>
                <Input 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" 
                />
                <div className="flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Phone Number</Label>
              <Input 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Role</Label>
              <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-md text-orange-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0"
              onClick={handleUpdateProfile}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-zinc-100">Security</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Change your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Current Password</Label>
              <Input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">New Password</Label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Confirm New Password</Label>
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-orange-500 focus:border-orange-500" 
              />
            </div>
            <Button 
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
