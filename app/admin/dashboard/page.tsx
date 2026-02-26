'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import AdminHeader from '@/components/admin/admin-header'
import AdminStats from '@/components/admin/admin-stats'
import MembersList from '@/components/admin/members-list'
import RevenueAnalytics from '@/components/admin/revenue-analytics'
import AttendanceOverview from '@/components/admin/attendance-overview'
import QRScanner from '@/components/admin/qr-scanner' // Import the scanner component
import { Users, TrendingUp, Calendar, CreditCard, QrCode } from 'lucide-react' // Import QrCode icon

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

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
          // Redirect non-admins to their respective dashboards or login
          router.push(userData.role === 'member' ? '/member/dashboard' : '/login');
          toast({ title: 'Access Denied', description: 'You do not have permission to view this page.', variant: 'destructive' });
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
    <div className="min-h-screen bg-background">
      <AdminHeader
        adminData={adminData}           // ← Add this!
        onLogout={handleLogout}         // ← Add this too if you want logout in header
        title="Admin Dashboard"
        description="Manage members, view analytics, and perform check-ins."
      />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <AdminStats />

        {/* Main Tabs */}
        <Tabs defaultValue="check-in" className="mt-8 space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="check-in" className="gap-2">
              <QrCode className="h-4 w-4" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Revenue
            </TabsTrigger>
          </TabsList>

          {/* Check-in Tab */}
          <TabsContent value="check-in">
            <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
              <QRScanner />
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <RevenueAnalytics />
            <AttendanceOverview />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <MembersList />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <AttendanceOverview />
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <RevenueAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
