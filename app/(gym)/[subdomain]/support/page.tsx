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
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import SupportClient from '@/components/support-client'

function SubdomainSupportContent() {
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
      
      if (!['admin', 'owner', 'secretary', 'trainer', 'member'].includes(userData.role)) {
        router.push('/login')
        return
      }

      setAdminData(userData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      if (!silent) toast.error('Failed to load support page')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

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

  // If the logged in user is a member, they might not use AdminSidebar. But if they're admin/staff, they do!
  const isStaff = ['admin', 'owner', 'secretary', 'trainer'].includes(adminData.role)

  if (!isStaff) {
    // For members, render a simpler layout (or standard container)
    return (
      <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <SupportClient />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar adminData={adminData} onLogout={handleLogout} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 sticky top-0 z-30 bg-background/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-[0.2em] text-muted-foreground">
                SYSTEM <span className="text-primary">SUPPORT</span>
              </h1>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pb-24 md:pb-20">
          <SupportClient />
        </div>

        {/* Mobile Navigation */}
        <AdminMobileNav role={adminData.role} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function SubdomainSupportPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <SubdomainSupportContent />
    </Suspense>
  )
}
