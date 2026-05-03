'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Check, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Star,
  Trophy,
  Menu,
  X
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PLANS, DURATIONS, PlanKey } from '@/lib/plans'
import DemoBookingModal from '@/components/demo-booking-modal'

const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-orange-500 font-black tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 block italic">
    {children}
  </span>
)

export default function PlansPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [selectedMonths, setSelectedMonths] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handlePayNow = (planKey: string) => {
    setLoadingPlan(planKey)
    router.push(`/get-started?plan=${planKey}&months=${selectedMonths}`)
  }

  const openModal = () => {
    setIsModalOpen(true)
    setIsMobileMenuOpen(false)
  }

  const currentDuration = DURATIONS.find(d => d.months === selectedMonths) || DURATIONS[0]

  return (
    <div className="min-h-screen bg-[#080808] text-foreground selection:bg-orange-500 selection:text-black font-sans relative">
      <DemoBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-gradient-to-b from-black/95 to-transparent backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
            <Image 
              src="/gympilotpro.png" 
              alt="GymPilotPro Logo" 
              width={160} 
              height={40} 
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic text-white">
              GymPilot<span className="text-orange-500">Pro</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-black tracking-widest">
            <Link href="/#features" className="hover:text-orange-500 transition-colors">Platform</Link>
            <button onClick={openModal} className="hover:text-orange-500 transition-colors">Book Demo</button>
            <Link href="/plans" className="text-orange-500">Pricing</Link>
            <Button
              onClick={openModal}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-none px-8 py-6 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              BOOK A DEMO
            </Button>
          </div>

          {/* Mobile Menu (Sheet) */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden text-white p-2 hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={28} />
              </button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-full sm:max-w-xs bg-black border-l border-zinc-800 p-0 flex flex-col"
            >
              <SheetHeader className="p-8 border-b border-zinc-800">
                <SheetTitle className="text-left">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/gympilotpro.png"
                      alt="GymPilotPro Logo"
                      width={120}
                      height={30}
                      className="h-6 w-auto object-contain"
                    />
                    <span className="text-xl font-black uppercase italic tracking-tighter text-white">
                      GymPilot<span className="text-orange-500">Pro</span>
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-8 p-10 text-2xl font-black uppercase tracking-tight italic text-white">
                <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Platform</Link>
                <button onClick={openModal} className="text-left hover:text-orange-500 transition-colors">Book Demo</button>
                <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)} className="text-orange-500">Pricing</Link>
              </div>

              <div className="mt-auto p-8 pb-12">
                <Button
                  onClick={openModal}
                  className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white text-xl font-black rounded-none shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                >
                  BOOK A DEMO
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10 text-center">
          <SectionTag>// Pricing Strategy</SectionTag>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tight italic mb-8 px-2">
            Scale Your <span className="text-orange-500 pr-2">Empire</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed mb-12">
            Choose the revenue protection plan that fits your gym's growth stage. 
            No hidden fees. No long-term contracts. Just pro results.
          </p>

          {/* Duration Toggles */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-16">
            {DURATIONS.map((d) => (
              <button
                key={d.months}
                onClick={() => setSelectedMonths(d.months)}
                className={cn(
                  "px-8 py-4 font-black text-sm uppercase tracking-widest border-2 transition-all duration-300 rounded-none",
                  selectedMonths === d.months
                    ? "bg-orange-500 border-orange-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] scale-105"
                    : "bg-transparent border-border text-muted-foreground hover:border-orange-500/50"
                )}
              >
                {d.label}
                {d.discount > 0 && (
                  <span className="ml-3 px-2 py-0.5 bg-white text-orange-500 text-[10px] font-black">
                    -{d.discount * 100}% OFF
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-32 relative">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {(Object.keys(PLANS) as PlanKey[]).map((key) => {
              const p = PLANS[key]
              const isPopular = key === 'pro'
              const discountedMonthly = p.monthlyFee * (1 - currentDuration.discount)
              const totalSetupAndMonthly = p.setupFee + (discountedMonthly * selectedMonths)

              const Icon = key === 'starter' ? Zap : key === 'pro' ? Star : Trophy

              return (
                <div
                  key={key}
                  className={cn(
                    "p-8 md:p-10 border-2 flex flex-col transition-all duration-500 relative group bg-background",
                    isPopular
                      ? "border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.15)] z-10 lg:-mt-4 lg:mb-4"
                      : "border-border hover:border-orange-500/30"
                  )}
                >
                  {isPopular && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-black px-6 py-2 shadow-xl tracking-[0.2em] uppercase italic">
                      Most Recommended
                    </span>
                  )}
                  
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-3xl font-black uppercase italic mb-1 text-white">{p.name}</h3>
                      <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">For {key === 'starter' ? 'Small Gyms' : key === 'pro' ? 'Growth Stages' : 'Elite Facilities'}</p>
                    </div>
                    <Icon className={cn("w-10 h-10", isPopular ? "text-orange-500" : "text-muted-foreground/30")} />
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="p-5 bg-white/5 border border-border group-hover:border-orange-500/30 transition-colors">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">One-Time Setup Fee</p>
                      <p className="text-3xl font-black tracking-tighter italic text-white">₦{p.setupFee.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-5 bg-orange-500/5 border border-orange-500/20">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">
                        Access Fee ({selectedMonths} Mo)
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tighter text-orange-500 italic">
                          ₦{(discountedMonthly * selectedMonths).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Total</span>
                      </div>
                      {currentDuration.discount > 0 && (
                        <p className="text-[10px] font-black text-green-500 mt-2 uppercase tracking-widest">
                          ✓ Multi-month discount applied
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-12 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-4 text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        <Check size={18} className="text-orange-500 shrink-0 mt-0.5" /> 
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-8 border-t border-border mb-8">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Due today</p>
                    <p className="text-2xl font-black tracking-tighter text-white italic">₦{totalSetupAndMonthly.toLocaleString()}</p>
                  </div>

                  <Button
                    disabled={loadingPlan !== null}
                    onClick={() => handlePayNow(key)}
                    className={cn(
                      "w-full h-16 rounded-none font-black uppercase text-lg transition-all duration-300",
                      isPopular 
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)]" 
                        : "bg-white hover:bg-orange-500 hover:text-white text-black"
                    )}
                  >
                    {loadingPlan === key ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</span>
                    ) : "Select Plan"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Objection Handling */}
      <section className="py-20 md:py-32 bg-[#0d0d0d] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center">
          <SectionTag>// Zero Risk</SectionTag>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-12 text-white">All Plans Include</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "24-Hour Setup", desc: "Your gym will be live and ready for members within 24 hours of selection." },
              { title: "Personal Training", desc: "We provide 1-on-1 staff training to ensure your team knows every feature." },
              { title: "Data Migration", desc: "We help you import your existing member list from Excel or paper logs." }
            ].map((item, i) => (
              <div key={i} className="p-8 border border-border bg-white/[0.02] text-left">
                <ShieldCheck className="text-orange-500 mb-4" size={32} />
                <h4 className="text-lg font-black uppercase mb-2 italic text-white">{item.title}</h4>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Trust CTA */}
      <section className="py-20 md:py-32 bg-[#080808]">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-8 text-white">
            Still have questions?
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-16 sm:h-20 px-12 bg-white text-black hover:bg-orange-500 hover:text-white font-black uppercase text-lg rounded-none transition-all"
          >
            Book a Quick Call
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-24 border-t border-border bg-[#080808]">
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
