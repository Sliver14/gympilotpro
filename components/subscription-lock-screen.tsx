'use client'

import { useState } from 'react'
import { AlertCircle, Loader2, LogOut, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionLockScreenProps {
  role: string
  gymId: string
  accent?: string
}

export function SubscriptionLockScreen({ role, gymId, accent = '#daa857' }: SubscriptionLockScreenProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isAdmin = role === 'admin' || role === 'owner'

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error(e)
    } finally {
      window.location.href = '/login'
    }
  }

  const handleRenew = async () => {
    setLoading(true)
    try {
      // 1. Call renew
      const resRenew = await fetch('/api/billing/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId })
      })
      const dataRenew = await resRenew.json()
      if (!resRenew.ok) throw new Error(dataRenew.error || 'Failed to initiate renewal')
      const { reference } = dataRenew

      toast({ title: 'Payment Initiated', description: 'Simulating secure payment gateway...' })

      // Simulate external payment redirect / flow here...
      await new Promise(r => setTimeout(r, 2000))

      // 2. Call verify
      const resVerify = await fetch('/api/billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, reference })
      })
      const dataVerify = await resVerify.json()
      if (!resVerify.ok) throw new Error(dataVerify.error || 'Failed to verify payment')
      
      toast({ title: 'Payment Successful', description: 'Subscription restored. Reloading...' })
      
      // Reload to lift the lock
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Renewal Failed', description: err.message || 'Please try again.', variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 font-sans">
      <div className="text-center space-y-6 max-w-lg w-full p-10 border border-white/5 bg-[#111] rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[#daa857]/5 opacity-20 pointer-events-none" style={{ backgroundColor: `${accent}0D` }} />
        
        <div className="h-24 w-24 bg-black rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-200 uppercase tracking-tighter italic">
          Subscription <span className="text-red-500">Expired</span>
        </h1>
        
        {isAdmin ? (
          <p className="text-gray-400 font-medium leading-relaxed px-4">
            Your subscription has expired. Renew now to restore access for you and your members.
          </p>
        ) : (
          <p className="text-gray-400 font-medium leading-relaxed px-4">
            This gym’s subscription has expired. Please contact the gym administrator for assistance.
          </p>
        )}

        <div className="pt-8 flex flex-col gap-4 relative z-10">
          {isAdmin && (
            <Button 
              onClick={handleRenew} 
              disabled={loading}
              className="w-full h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
              style={{ backgroundColor: accent }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CreditCard className="h-5 w-5 mr-2" /> Renew Plan</>}
            </Button>
          )}
          
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="w-full h-14 border-white/10 bg-transparent hover:bg-white/5 text-gray-500 font-black uppercase tracking-widest rounded-xl"
          >
            <LogOut className="h-5 w-5 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
