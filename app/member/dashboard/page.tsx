'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { MemberSidebar } from '@/components/member/member-sidebar'
import { MemberMobileNav } from '@/components/member/member-mobile-nav'
import MemberProfile from '@/components/member/member-profile'
import AttendanceHistory from '@/components/member/attendance-history'
import ProgressNotes from '@/components/member/progress-notes'
import QRCodeDisplay from '@/components/member/qr-code-display'
import { Spinner } from '@/components/ui/spinner'

interface MemberData {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  monthlyVisits?: number
  memberProfile: {
    expiryDate: string
    membership: {
      name: string
      price: number
    }
    fitnessGoals: string
    profileImage: string | null
    emergencyContact: string | null
    emergencyPhone: string | null
  }
}

interface AttendanceData {
  id: string
  checkInTime: string
  checkOutTime: string | null
  method: string
}

function MemberDashboardContent() {
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [membershipStatus, setMembershipStatus] = useState<'active' | 'expiring' | 'expired'>('active')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const currentTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        // Single aggregated API call instead of 3 separate calls
        const response = await fetch('/api/member/dashboard')
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setMemberData(data.member)
        setAttendanceHistory(data.attendance)

        // Check membership status
        const expiryDate = new Date(data.member.memberProfile.expiryDate)
        const today = new Date()
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry < 0) {
          setMembershipStatus('expired')
          toast({
            title: 'Membership Expired',
            description: 'Your membership has expired. Please renew to continue accessing the gym.',
            variant: 'destructive',
          })
        } else if (daysUntilExpiry <= 7) {
          setMembershipStatus('expiring')
          toast({
            title: 'Membership Expiring Soon',
            description: `Your membership expires in ${daysUntilExpiry} days. Consider renewing now.`,
          })
        }
      } catch (error) {
        console.error('Error fetching member data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load member data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemberData()
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

  if (!memberData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Failed to load member data</p>
      </div>
    )
  }

  const expiryDate = new Date(memberData.memberProfile.expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <SidebarProvider>
      <MemberSidebar memberData={memberData} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Member Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pb-24 md:pb-20">
          {/* Membership Status Alert */}
          {membershipStatus === 'expired' && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="flex items-start gap-4 pt-6">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Membership Expired</h3>
                  <p className="text-sm text-muted-foreground">
                    Your membership expired on {expiryDate.toLocaleDateString()}. Please renew to continue using the gym.
                  </p>
                  <Link href="/member/renew-membership">
                    <Button size="sm" className="mt-2" variant="default">
                      Renew Membership
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {membershipStatus === 'expiring' && (
            <Card className="border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="flex items-start gap-4 pt-6">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-600">Membership Expiring Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Your membership expires in {daysUntilExpiry} days on {expiryDate.toLocaleDateString()}. Extend your subscription now to stay active.
                  </p>
                  <Link href="/member/renew-membership">
                    <Button size="sm" variant="outline" className="mt-2 gap-2">
                      Extend Subscription
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Content */}
          <div className="space-y-4">
            <div className={currentTab === 'overview' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
                      {membershipStatus !== 'expired' && (
                        <Link href="/member/renew-membership">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold text-primary hover:bg-primary/10">
                            Extend
                          </Button>
                        </Link>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{memberData.memberProfile.membership.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {membershipStatus === 'active' && 'Active'}
                        {membershipStatus === 'expiring' && 'Expiring Soon'}
                        {membershipStatus === 'expired' && 'Expired'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{Math.max(0, daysUntilExpiry)}</p>
                      <p className="text-xs text-muted-foreground">Until {expiryDate.toLocaleDateString()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {memberData?.monthlyVisits ?? attendanceHistory.filter((a) => {
                          const date = new Date(a.checkInTime)
                          const now = new Date()
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                        }).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Visits</p>
                    </CardContent>
                  </Card>
                </div>
                
                <MemberProfile memberData={memberData} />
              </div>
            </div>

            <div className={currentTab === 'qr-code' ? 'block' : 'hidden'}>
              <QRCodeDisplay memberId={memberData.id} />
            </div>

            <div className={currentTab === 'attendance' ? 'block' : 'hidden'}>
              <AttendanceHistory attendance={attendanceHistory} />
            </div>

            <div className={currentTab === 'progress' ? 'block' : 'hidden'}>
              <ProgressNotes memberId={memberData.id} />
            </div>
          </div>
        </div>
        <MemberMobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function MemberDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <MemberDashboardContent />
    </Suspense>
  )
}
