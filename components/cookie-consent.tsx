'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="max-w-md bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Trust & Security</h3>
            <p className="text-[11px] font-bold text-zinc-400 leading-relaxed">
              We use cookies to enhance your terminal experience and ensure the security of your gym sanctuary. 
              Review our <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Protocol</Link> for more details.
            </p>
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleAccept}
                className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase rounded-lg transition-all active:scale-95"
              >
                Accept Protocols
              </Button>
              <Button 
                variant="ghost"
                onClick={handleDecline}
                className="h-10 px-4 text-zinc-500 hover:text-white font-black text-[10px] uppercase rounded-lg"
              >
                Decline
              </Button>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
