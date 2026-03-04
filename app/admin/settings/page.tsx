'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'
import SettingsForm from '@/components/settings-form'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

function AdminSettingsContent() {
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchAdminData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const userResponse = await fetch('/api/auth/user')
      if (!userResponse.ok) {
        router.push('/login')
        return
      }

      const userData = await userResponse.json()
      
      if (!['admin', 'secretary', 'trainer'].includes(userData.role)) {
        router.push(userData.role === 'member' ? '/member/dashboard' : '/login')
        return
      }

      setAdminData(userData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      if (!silent) toast.error('Failed to load settings')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  const refreshData = () => {
    fetchAdminData(true)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!adminData) return null

  return (
    <SidebarProvider>
      <AdminSidebar adminData={adminData} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pb-24 md:pb-20">
          <div className="max-w-4xl">
            <SettingsForm userData={adminData} onUpdate={refreshData} />
          </div>
        </div>
        <AdminMobileNav role={adminData.role} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminSettings() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <AdminSettingsContent />
    </Suspense>
  )
}
