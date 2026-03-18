'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  profileImage?: string | null
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
  const [error, setError] = useState<string | null>(null)
  const [membershipStatus, setMembershipStatus] = useState<'active' | 'expiring' | 'expired'>('active')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const currentTab = searchParams.get('tab') || 'overview'

  const fetchMemberData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    setError(null)
    try {
      // Single aggregated API call instead of 3 separate calls
      const response = await fetch('/api/member/dashboard')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        
        // If 404, the user might be a staff member trying to access the member dashboard
        if (response.status === 404) {
          try {
            const userRes = await fetch('/api/auth/user')
            if (userRes.ok) {
              const userData = await userRes.json()
              if (userData.role !== 'member') {
                router.push(`/${userData.role}/dashboard`)
                return
              }
            }
          } catch (e) {
            console.error('Failed to fetch user role for redirect:', e)
          }
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch dashboard data')
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
      } else if (daysUntilExpiry <= 7) {
        setMembershipStatus('expiring')
      } else {
        setMembershipStatus('active')
      }
    } catch (error: any) {
      console.error('Error fetching member data:', error)
      const errorMessage = error.message || 'Failed to load member data'
      setError(errorMessage)
      if (!silent) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    fetchMemberData()
  }, [fetchMemberData])

  const refreshDashboard = () => {
    fetchMemberData(true)
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

  if (error || !memberData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Dashboard Error</h2>
          <p className="text-muted-foreground max-w-md">{error || 'Failed to load member data'}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => fetchMemberData()}>Try Again</Button>
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>
      </div>
    )
  }

  const expiryDate = new Date(memberData.memberProfile.expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <SidebarProvider>
      <MemberSidebar memberData={memberData} onLogout={handleLogout} />
      <SidebarInset className="bg-[#0a0a0a]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-6 sticky top-0 z-30 bg-black/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase italic tracking-[0.2em] text-gray-400">
              Member <span className="text-[#daa857]">Terminal</span>
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-10 pb-24 md:pb-20">
          {/* Membership Status Alert */}
          {membershipStatus === 'expired' && (
            <div className="rounded-3xl p-8 border-2 border-red-500/20 bg-red-500/5 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/10 blur-[80px]" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-1">Access Expired</h3>
                  <p className="text-sm font-medium text-gray-400 max-w-xl">
                    Your membership expired on <span className="text-red-400 font-bold">{expiryDate.toLocaleDateString()}</span>. The terminal is locked until renewal is processed.
                  </p>
                  <Link href="/member/renew-membership">
                    <Button className="mt-6 h-12 px-8 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02]">
                      Initiate Renewal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {membershipStatus === 'expiring' && (
            <div className="rounded-3xl p-8 border-2 border-[#daa857]/20 bg-[#daa857]/5 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/10 blur-[80px]" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-[#daa857] flex items-center justify-center shrink-0 shadow-lg shadow-[#daa857]/20">
                  <AlertCircle className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-1">Subscription Warning</h3>
                  <p className="text-sm font-medium text-gray-400 max-w-xl">
                    Gym access expires in <span className="text-[#daa857] font-bold">{daysUntilExpiry} days</span> ({expiryDate.toLocaleDateString()}). Extend plan now to maintain uninterrupted access.
                  </p>
                  <Link href="/member/renew-membership">
                    <Button className="mt-6 h-12 px-8 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02]">
                      Extend Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="space-y-8">
            <div className={currentTab === 'overview' ? 'block' : 'hidden'}>
              <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { label: 'Current Tier', value: memberData.memberProfile.membership.name, sub: membershipStatus.toUpperCase(), accent: true },
                    { label: 'Active Days', value: Math.max(0, daysUntilExpiry), sub: `Until ${expiryDate.toLocaleDateString()}` },
                    { label: 'Monthly Visits', value: memberData?.monthlyVisits ?? attendanceHistory.filter((a) => {
                      const date = new Date(a.checkInTime);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length, sub: 'TRAINING SESSIONS' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#111] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-[#daa857]/30 transition-colors">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className={cn("text-4xl font-black italic tracking-tighter", stat.accent ? "text-[#daa857]" : "text-white")}>
                          {stat.value}
                        </p>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mt-2">{stat.sub}</p>
                    </div>
                  ))}
                </div>
                
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <MemberProfile memberData={memberData} onUpdate={refreshDashboard} />
                </div>
              </div>
            </div>

            <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentTab === 'qr-code' ? 'block' : 'hidden')}>
              <QRCodeDisplay memberId={memberData.id} />
            </div>

            <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentTab === 'attendance' ? 'block' : 'hidden')}>
              <AttendanceHistory attendance={attendanceHistory} />
            </div>

            <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentTab === 'progress' ? 'block' : 'hidden')}>
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
