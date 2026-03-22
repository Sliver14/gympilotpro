'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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

  if (isLoading || !adminData || !gymData) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]"><Spinner className="h-8 w-8 text-[#daa857]" /></div>
  }

  const currentPlan = gymData.subscriptions?.[0]?.plan || 'starter'

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <div className="p-6 md:p-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground focus:text-foreground uppercase text-[10px] font-black tracking-widest gap-2 p-0 h-auto mb-4"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </Button>
      </div>

      <div className="relative flex-1">
        <SubscriptionLockScreen 
          role={adminData.role}
          gymId={gymData.id}
          gymStatus={gymData.status}
          currentPlan={currentPlan}
          accent={gymData.primaryColor}
          isUpgradeMode={true}
        />
      </div>
    </div>
  )
}

export default function AdminBilling() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]"><Spinner className="h-8 w-8 text-primary" /></div>}>
      <AdminBillingContent />
    </Suspense>
  )
}
