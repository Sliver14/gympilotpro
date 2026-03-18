'use client'

import { AlertCircle } from 'lucide-react'

interface ExpiredSubscriptionOverlayProps {
  role: string
  accent?: string
}

export function ExpiredSubscriptionOverlay({ role, accent = '#daa857' }: ExpiredSubscriptionOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 font-sans">
      <div className="text-center space-y-6 max-w-lg w-full">
        <div className="h-24 w-24 bg-[#111] rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#daa857]/5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${accent}0D` }} />
          <AlertCircle className="h-10 w-10 text-gray-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-300 uppercase tracking-tighter italic">
          Service <span style={{ color: accent }}>Paused</span>
        </h1>
        
        <p className="text-gray-500 font-medium leading-relaxed px-4">
          This gym's subscription is currently inactive. Please contact the gym owner or administration for more information.
        </p>

        <div className="pt-8">
          <p className="text-gray-700 font-black tracking-[0.3em] text-[10px] uppercase">
            GymPilotPro Systems © 2026
          </p>
        </div>
      </div>
    </div>
  )
}
