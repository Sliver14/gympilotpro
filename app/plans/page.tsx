'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Check, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  Users, 
  QrCode, 
  Layers, 
  Globe 
} from 'lucide-react'
import DemoBookingModal from '@/components/demo-booking-modal'

const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-orange-500 font-black tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 block italic uppercase">
    {children}
  </span>
)

export default function PlansPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleGetStarted = () => {
    setLoading(true)
    router.push('/get-started')
  }

  return (
    <div className="min-h-screen bg-[#080808] text-foreground selection:bg-orange-500 selection:text-black font-sans relative">
      <DemoBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 h-20 sm:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/gympilotpro.png" 
              alt="GymPilotPro Logo" 
              width={140} 
              height={35} 
              className="h-7 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic text-white">
              GymPilot<span className="text-orange-500">Pro</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors hidden sm:block">
              Home
            </Link>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 font-bold uppercase text-xs rounded-none"
            >
              Book Demo
            </Button>
            <Button
              onClick={handleGetStarted}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-xs rounded-none shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.12),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10 text-center">
          <SectionTag>// Performance-Based Monetization</SectionTag>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tight italic mb-6 px-2 text-white">
            Pay As You <span className="text-orange-500 pr-2">Grow</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed mb-6">
            No expensive software upfront. We only win when you win. Simple, transparent <span className="text-orange-500 font-bold">5% commission</span> on member subscriptions.
          </p>
        </div>
      </section>

      {/* Main Pricing Hero Card */}
      <section className="pb-24 relative">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 max-w-4xl">
          <div className="p-8 md:p-14 border-2 border-orange-500 bg-background shadow-[0_0_60px_rgba(249,115,22,0.15)] relative">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-black px-6 py-2 shadow-xl tracking-[0.2em] uppercase italic">
              All-Inclusive Revenue Share
            </span>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-border">
              <div>
                <h3 className="text-3xl md:text-4xl font-black uppercase italic text-white mb-2">
                  GymPilotPro Complete
                </h3>
                <p className="text-muted-foreground text-sm font-medium">
                  Full enterprise features unlocked for every gym from Day 1.
                </p>
              </div>

              <div className="text-left md:text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black text-orange-500 italic tracking-tighter">
                    5%
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    of Member Revenue
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-bold uppercase block mt-1">
                  ₦0 Upfront • Billed Monthly
                </span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Users, title: "Unlimited Members", desc: "No artificial member caps or tier limits. Register as many members as you want." },
                { icon: QrCode, title: "Instant QR Check-ins", desc: "Digital member pass scanning with automated expiry detection." },
                { icon: TrendingUp, title: "Automated WhatsApp & Email", desc: "Send payment renewal reminders automatically to keep revenue recurring." },
                { icon: Layers, title: "Multi-Branch Support", desc: "Manage multiple branches, staff roles, and centralized accounting seamlessly." },
                { icon: Globe, title: "Custom Subdomain & Domain", desc: "Professional member portal branded to your gym identity." },
                { icon: ShieldCheck, title: "2-Month Grace Window", desc: "Monthly invoicing with a generous 60-day window before account restrictions." },
              ].map((feat, i) => {
                const IconComponent = feat.icon;
                return (
                  <div key={i} className="flex gap-4 p-4 bg-white/[0.02] border border-border">
                    <div className="h-10 w-10 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <IconComponent className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase">{feat.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Total Due Today
                </p>
                <p className="text-3xl font-black text-white italic">₦0</p>
              </div>

              <Button
                disabled={loading}
                onClick={handleGetStarted}
                className="w-full sm:w-auto h-16 px-10 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-lg rounded-none shadow-[0_10px_20px_rgba(249,115,22,0.2)]"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Setting up...</span>
                ) : (
                  "Create Gym Account Free"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Objection Handling */}
      <section className="py-20 bg-[#0d0d0d] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center">
          <SectionTag>// Fair & Predictable</SectionTag>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-12 text-white">How Billing Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Collect from Members",
                desc: "Members pay online via Paystack or in cash/POS. You approve payments and retain 95% of all funds."
              },
              {
                step: "02",
                title: "Monthly Invoicing",
                desc: "On the 1st of each month, an invoice for 5% of your approved member payments is automatically issued."
              },
              {
                step: "03",
                title: "2-Month Grace Period",
                desc: "You have 2 full months to settle your invoice via Paystack before any operational restrictions apply."
              }
            ].map((item, i) => (
              <div key={i} className="p-8 border border-border bg-white/[0.02] text-left">
                <span className="text-orange-500 text-3xl font-black italic block mb-3">{item.step}</span>
                <h4 className="text-lg font-black uppercase mb-2 italic text-white">{item.title}</h4>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border bg-[#080808]">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/gympilotpro.png" 
                alt="GymPilotPro Logo" 
                width={120} 
                height={30} 
                className="h-6 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic text-white">
                GymPilot<span className="text-orange-500">Pro</span>
              </span>
            </Link>
            <p className="text-xs font-black tracking-[0.2em] text-muted-foreground italic uppercase">
              © 2026 GYMPILOTPRO SYSTEMS. RUN LIKE A PRO.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
