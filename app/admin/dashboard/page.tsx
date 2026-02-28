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
import RevenueAnalytics from '@/components/admin/revenue-analytics'
import AttendanceOverview from '@/components/admin/attendance-overview'
import CheckInPanel from '@/components/admin/check-in-panel'

function AdminDashboardContent() {
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
        if (!['admin', 'secretary', 'trainer'].includes(userData.role)) {
          router.push(userData.role === 'member' ? '/member/dashboard' : '/login')
          toast({ title: 'Access Denied', description: 'You do not have permission to view this page.', variant: 'destructive' })
          return
        }

        setAdminData(userData)
      } catch (error) {
        console.error('Error fetching admin data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load admin dashboard',
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
        <p className="text-muted-foreground">Loading...</p>
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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 md:pb-20">
          {/* Tab Content */}
          <div className="space-y-4">
            <div className={currentTab === 'check-in' ? 'block' : 'hidden'}>
              <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
                <CheckInPanel />
              </div>
            </div>

            <div className={currentTab === 'overview' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                {/* Stats Overview */}
                <AdminStats />
                <RevenueAnalytics />
                <AttendanceOverview />
              </div>
            </div>

            <div className={currentTab === 'members' ? 'block' : 'hidden'}>
              <MembersList />
            </div>

            <div className={currentTab === 'attendance' ? 'block' : 'hidden'}>
              <AttendanceOverview />
            </div>

            <div className={currentTab === 'revenue' ? 'block' : 'hidden'}>
              <RevenueAnalytics />
            </div>
          </div>
        </div>
        <AdminMobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
