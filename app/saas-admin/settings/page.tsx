import { getCurrentUser } from '@/lib/auth'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'superadmin') return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Platform Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your SaaS administrator account and global platform configurations.</p>
      </div>

      <SettingsClient user={{
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber
      }} />
    </div>
  )
}
