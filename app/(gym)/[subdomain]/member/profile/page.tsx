'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { MemberSidebar } from '@/components/member/member-sidebar'
import { MemberMobileNav } from '@/components/member/member-mobile-nav'
import SettingsForm from '@/components/settings-form'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

function MemberProfileSettingsContent() {
  const [memberData, setMemberData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchMemberData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const userResponse = await fetch('/api/auth/user')
      if (!userResponse.ok) {
        router.push('/login')
        return
      }

      const userData = await userResponse.json()
      
      if (userData.role !== 'member') {
        router.push(`/${userData.role}/dashboard`)
        return
      }

      setMemberData(userData)
    } catch (error) {
      console.error('Error fetching member data:', error)
      if (!silent) toast.error('Failed to load profile')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchMemberData()
  }, [fetchMemberData])

  const refreshData = () => {
    fetchMemberData(true)
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

  if (!memberData) return null

  return (
    <SidebarProvider>
      <MemberSidebar memberData={memberData} onLogout={handleLogout} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6 sticky top-0 z-30 bg-card/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-[0.2em] text-muted-foreground">
              Profile <span className="text-[#daa857]">Settings</span>
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 md:gap-8 p-4 md:p-6 pb-24 md:pb-20">
          <div className="max-w-4xl mx-auto w-full">
            <SettingsForm userData={memberData} onUpdate={refreshData} />
          </div>
        </div>
        <MemberMobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function MemberProfileSettings() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <MemberProfileSettingsContent />
    </Suspense>
  )
}
