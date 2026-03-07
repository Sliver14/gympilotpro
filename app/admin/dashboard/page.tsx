'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'
import AdminStats from '@/components/admin/admin-stats'
import MembersList from '@/components/admin/members-list'
import StaffList from '@/components/admin/staff-list'
import PendingPayments from '@/components/admin/pending-payments'
import ExpiredMembersList from '@/components/admin/expired-members-list'
import RevenueAnalytics from '@/components/admin/revenue-analytics'
import AttendanceOverview from '@/components/admin/attendance-overview'
import CheckInPanel from '@/components/admin/check-in-panel'
import { Spinner } from '@/components/ui/spinner'

function AdminDashboardContent() {
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const currentTab = searchParams.get('tab') || 'overview'

  const fetchAdminData = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/user')
      if (!userResponse.ok) {
        router.push('/login')
        return
      }

      const userData = await userResponse.json()
      
      // Ensure only authorized roles can access
      if (!['admin', 'secretary', 'trainer'].includes(userData.role)) {
        router.push(userData.role === 'member' ? '/member/dashboard' : '/login')
        toast({ title: 'Access Denied', description: 'You do not have permission to view this page.', variant: 'destructive' })
        return
      }

      setAdminData(userData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  const refreshDashboard = () => {
    setRefreshTrigger(prev => prev + 1)
  }

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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-6 sticky top-0 z-30 bg-black/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase italic tracking-[0.2em] text-gray-400">
              {adminData.role} <span className="text-[#daa857]">Command</span>
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
                {/* Stats Overview */}
                <AdminStats refreshTrigger={refreshTrigger} />
                <RevenueAnalytics />
                <AttendanceOverview />
              </div>
            </div>

            <div className={currentTab === 'members' ? 'block' : 'hidden'}>
              <MembersList onMemberAdded={refreshDashboard} />
            </div>

            <div className={currentTab === 'staff' ? 'block' : 'hidden'}>
              <StaffList />
            </div>

            <div className={currentTab === 'payments' ? 'block' : 'hidden'}>
              <div className="space-y-10">
                <PendingPayments onPaymentProcessed={refreshDashboard} />
                <ExpiredMembersList />
              </div>
            </div>

            <div className={currentTab === 'attendance' ? 'block' : 'hidden'}>
              <AttendanceOverview />
            </div>

            <div className={currentTab === 'revenue' ? 'block' : 'hidden'}>
              <RevenueAnalytics />
            </div>
          </div>
        </div>
        <AdminMobileNav role={adminData.role} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
