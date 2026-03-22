'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'
import AdminStats from '@/components/admin/admin-stats'
import MembersList from '@/components/admin/members-list'
import PendingPayments from '@/components/admin/pending-payments'
import ExpiredMembersList from '@/components/admin/expired-members-list'
import AttendanceOverview from '@/components/admin/attendance-overview'
import CheckInPanel from '@/components/admin/check-in-panel'
import { GymQRCode } from '@/components/gym-qr-code'
import { Spinner } from '@/components/ui/spinner'

function TrainerDashboardContent() {
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const currentTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userResponse = await fetch('/api/auth/user')
        if (!userResponse.ok) {
          router.push('/login')
          return
        }

        const userData = await userResponse.json()
        
        // Ensure only authorized roles can access
        if (!['admin', 'trainer'].includes(userData.role)) {
          router.push(userData.role === 'member' ? '/member/dashboard' : '/login')
          toast({ title: 'Access Denied', description: 'You do not have permission to view this page.', variant: 'destructive' })
          return
        }

        setAdminData(userData)
      } catch (error) {
        console.error('Error fetching admin data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load dashboard',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [router, toast])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!adminData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar adminData={adminData} onLogout={handleLogout} />
      <SidebarInset className="bg-[#0a0a0a]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6 sticky top-0 z-30 bg-card/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase italic tracking-[0.2em] text-muted-foreground">
              Trainer <span className="text-[#daa857]">Dashboard</span>
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 pb-24 md:pb-20">
          {/* Tab Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={currentTab === 'check-in' ? 'block' : 'hidden'}>
              <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
                <CheckInPanel />
              </div>
            </div>

            <div className={currentTab === 'overview' ? 'block' : 'hidden'}>
              <div className="space-y-10">
                {/* Stats Overview - Revenue hidden */}
                <AdminStats hideRevenue={true} />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="md:col-span-1">
                    {adminData?.gym && (
                      <GymQRCode
                        qrCodeUrl={adminData.gym.qrCodeUrl}
                        gymUrl={`https://${adminData.gym.customDomain && adminData.gym.domainVerified ? adminData.gym.customDomain : `${adminData.gym.slug}.gympilotpro.com`}`}
                        gymName={adminData.gym.name}
                      />
                    )}
                  </div>
                </div>
                <AttendanceOverview />
              </div>
            </div>

            <div className={currentTab === 'members' ? 'block' : 'hidden'}>
              <MembersList />
            </div>

            <div className={currentTab === 'payments' ? 'block' : 'hidden'}>
              <div className="space-y-10">
                <PendingPayments />
                <ExpiredMembersList />
              </div>
            </div>

            <div className={currentTab === 'attendance' ? 'block' : 'hidden'}>
              <AttendanceOverview />
            </div>
          </div>
        </div>
        <AdminMobileNav role={adminData.role} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function TrainerDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <TrainerDashboardContent />
    </Suspense>
  )
}
