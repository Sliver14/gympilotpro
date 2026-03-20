'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { SubscriptionLockScreen } from '@/components/subscription-lock-screen'
import { useGym } from '@/components/gym-provider'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

function AdminBillingContent() {
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { gymData } = useGym()

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true)
    try {
      const userResponse = await fetch('/api/auth/user')
      if (!userResponse.ok) return router.push('/login')

      const userData = await userResponse.json()
      if (!['admin', 'owner'].includes(userData.role)) {
        return router.push('/member/dashboard')
      }
      setAdminData(userData)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (isLoading || !adminData || !gymData) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]"><Spinner className="h-8 w-8 text-[#daa857]" /></div>
  }

  const currentPlan = gymData.subscriptions?.[0]?.plan || 'starter'

  return (
    <SidebarProvider>
      <AdminSidebar adminData={adminData} onLogout={handleLogout} />
      <SidebarInset className="bg-[#0a0a0a]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-6 sticky top-0 z-30 bg-black/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase italic tracking-[0.2em] text-gray-400">
              Admin <span className="text-[#daa857]">Billing</span>
            </h1>
          </div>
        </header>

        <div className="relative flex-1 bg-[#0a0a0a]">
          <SubscriptionLockScreen 
            role={adminData.role}
            gymId={gymData.id}
            gymStatus={gymData.status}
            currentPlan={currentPlan}
            accent={gymData.primaryColor}
            isUpgradeMode={true}
          />
        </div>
        
        <AdminMobileNav role={adminData.role} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminBilling() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]"><Spinner className="h-8 w-8 text-primary" /></div>}>
      <AdminBillingContent />
    </Suspense>
  )
}
