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
import PackagesList from '@/components/admin/packages-list'
import AnalyticsView from '@/components/admin/analytics-view'
import { GymQRCode } from '@/components/gym-qr-code'
import { Spinner } from '@/components/ui/spinner'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AdminDashboardContent() {
  const [adminData, setAdminData] = useState<any>(null)
  const [hasPackages, setHasPackages] = useState<boolean>(true)
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

      // Initial check for packages for the banner
      const pkgRes = await fetch('/api/admin/packages')
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json()
        setHasPackages(pkgData.packages.length > 0)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData, refreshTrigger])

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

  const hasBankDetails = !!(adminData.gym?.bankName && adminData.gym?.accountNumber && adminData.gym?.accountName)
  const isConfigComplete = hasBankDetails && hasPackages

  return (
    <SidebarProvider>
      <AdminSidebar adminData={adminData} onLogout={handleLogout} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 sticky top-0 z-30 bg-background/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-[0.2em] text-muted-foreground">
                {adminData.role} <span className="text-primary">Dashboard</span>
              </h1>
            </div>
            {!isConfigComplete && adminData.role === 'admin' && (
              <div className="hidden md:flex items-center gap-4 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full animate-pulse">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black text-primary">
                  Compulsory Configuration Pending: 
                  {!hasPackages && " [Create Packages]"}
                  {!hasBankDetails && " [Add Bank Details]"}
                </span>
              </div>
            )}
          </div>
        </header>

        {!isConfigComplete && adminData.role === 'admin' && (
          <div className="p-4 md:p-6 pb-0">
            <div className="bg-gradient-to-r from-primary/20 to-transparent border border-primary/30 rounded-[2rem] p-4 md:p-8 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Action Required</h2>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed max-w-xl">
                    Your gym sanctuary is live, but members cannot register or renew without core configurations. 
                    Please complete these steps to ensure uninterrupted operations.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {!hasPackages && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-lg text-[10px] font-black text-destructive">
                        Missing Membership Packages
                      </div>
                    )}
                    {!hasBankDetails && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-lg text-[10px] font-black text-destructive">
                        Missing Bank Account Details
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => router.push(hasPackages ? '/admin/settings' : '?tab=packages')}
                  className="h-14 px-10 bg-primary hover:bg-primary/80 text-primary-foreground font-black rounded-xl shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95"
                >
                  Configure Now
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 md:gap-8 p-4 md:p-6 pb-24 md:pb-20">
          {/* Tab Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={currentTab === 'check-in' ? 'block' : 'hidden'}>
              <div className="mx-auto grid w-full max-w-2xl items-start gap-4 md:gap-6">
                <CheckInPanel />
              </div>
            </div>

            <div className={currentTab === 'overview' ? 'block' : 'hidden'}>
              <div className="space-y-10">
                {/* Stats Overview */}
                <AdminStats refreshTrigger={refreshTrigger} />
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
                  <div className="md:col-span-1 lg:col-span-2 space-y-10">
                    <RevenueAnalytics />
                  </div>
                </div>
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

            <div className={currentTab === 'packages' ? 'block' : 'hidden'}>
              <PackagesList onPackageUpdate={refreshDashboard} />
            </div>

            <div className={currentTab === 'analytics' ? 'block' : 'hidden'}>
              <AnalyticsView />
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
