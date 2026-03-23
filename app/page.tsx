'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  Users, 
  Zap, 
  ChevronRight,
  Check,
  MessageSquare,
  Globe,
  LayoutDashboard,
  AlertCircle,
  Loader2,
  Quote
} from 'lucide-react'

import { PLANS, DURATIONS, PlanKey } from '@/lib/plans'

// Reusable Components
const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-orange-500 font-black tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 block italic">
    {children}
  </span>
)

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="group p-4 md:p-6 sm:p-8 rounded-none border-l-2 border-border bg-white/[0.02] backdrop-blur-sm hover:bg-orange-500/5 hover:border-orange-500 transition-all duration-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="mb-5 sm:mb-6 inline-block p-3 bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform relative z-10">
      <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl sm:text-2xl font-black uppercase mb-3 tracking-tight relative z-10 italic">
      {title}
    </h3>
    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium relative z-10">
      {desc}
    </p>
  </div>
)

export default function SaaSLandingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [selectedMonths, setSelectedMonths] = useState(1)

  const handlePayNow = (planKey: string) => {
    setLoadingPlan(planKey)
    router.push(`/get-started?plan=${planKey}&months=${selectedMonths}`)
  }

  const currentDuration = DURATIONS.find(d => d.months === selectedMonths) || DURATIONS[0]

  return (
    <div className="min-h-screen bg-[#080808] text-foreground selection:bg-orange-500 selection:text-black font-sans relative">
      {/* Navigation - Add hamburger menu for mobile when ready */}
      <nav className="absolute top-0 w-full z-[100] bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 h-16 md:h-20 sm:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/gympilotpro.png" 
              alt="GymPilotPro Logo" 
              width={160} 
              height={40} 
              className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">
              GymPilot<span className="text-orange-500">Pro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4 md:gap-8 lg:gap-10 text-xs sm:text-[11px] font-black tracking-[0.2em]">
            <Link href="#features" className="hover:text-orange-500 transition-colors">Platform</Link>
            <Link href="#demo" className="hover:text-orange-500 transition-colors">Demo</Link>
            <Link href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</Link>
            <Button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-none px-6 sm:px-8 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              GET STARTED
            </Button>
          </div>

          {/* Mobile menu placeholder */}
          {/* <button className="md:hidden">☰</button> */}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[80vh] sm:min-h-screen flex items-center pt-20 sm:pt-24 pb-16 sm:pb-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Premium Gym"
            className="w-full h-full object-cover opacity-50 grayscale"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]" />
        </div>

        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="max-w-4xl lg:max-w-5xl">
            <SectionTag>// Performance Infrastructure</SectionTag>
            <h1 className="text-3xl md:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase leading-[0.9] mb-6 sm:mb-8 tracking-tighter italic">
              Run Your Gym <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-500/50 border-t-2 border-b-2 border-border">
                Like A Pro
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
              Stop losing money from expired members. Automate your gym and get paid on time, every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <Button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 sm:h-16 md:h-20 px-8 sm:px-10 md:px-12 bg-orange-500 text-white hover:bg-orange-600 text-base sm:text-xl font-black uppercase rounded-none group"
              >
                Start Your Journey <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button
                asChild
                className="h-14 sm:h-16 md:h-20 px-8 sm:px-10 md:px-12 text-foreground border-2 border-border hover:border-orange-500/50 hover:bg-orange-500/5 hover:text-foreground text-base sm:text-xl font-black uppercase rounded-none bg-white/5 backdrop-blur-sm transition-all"
              >
                <Link href="#features">Explore Platform</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-[#080808] to-[#0d0d0d] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:gap-10 md:gap-16 items-start md:items-end mb-12 md:mb-20">
            <div className="flex-1">
              <SectionTag>// The Problem</SectionTag>
              <h2 className="text-2xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic">
                Manual Management <br /><span className="text-orange-500">Kills Growth</span>
              </h2>
            </div>
            <p className="flex-1 text-muted-foreground text-lg sm:text-xl font-medium max-w-lg">
              Inconsistent tracking leads to revenue leakage. If you aren't automating, you're leaving money on the gym floor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-white/5 p-1 border border-border">
            {[
              { title: "Expired Access", desc: "Non-paying members slipping through the cracks daily." },
              { title: "Zero Data", desc: "Flying blind without real-time profit and churn analytics." },
              { title: "Manual Chaos", desc: "Drowning in paper logs and fragmented WhatsApp messages." },
              { title: "Retention Loss", desc: "No automated system to bring members back before they quit." }
            ].map((item, i) => (
              <div key={i} className="bg-background p-4 md:p-6 sm:p-8 md:p-10 hover:bg-orange-500/5 transition-colors">
                <AlertCircle className="text-orange-500 mb-4 sm:mb-6" size={28} />
                <h4 className="text-lg sm:text-xl font-black uppercase mb-3 sm:mb-4">{item.title}</h4>
                <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 lg:py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center mb-16 md:mb-24">
          <SectionTag>// Command & Control</SectionTag>
          <h2 className="text-2xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic">Pro-Grade Tools</h2>
        </div>
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 md:gap-8">
          <FeatureCard icon={Users} title="Access Control" desc="QR and Biometric integration to ensure only active members enter." />
          <FeatureCard icon={MessageSquare} title="Auto-Pilot Comms" desc="Automatically send WhatsApp reminders before memberships expire — so you never miss payments again." />
          <FeatureCard icon={BarChart3} title="Deep Analytics" desc="Track MRR, peak hours, and trainer performance at a glance." />
          <FeatureCard icon={Globe} title="Cloud Sync" desc="Manage multiple branches from a single, unified owner dashboard." />
          <FeatureCard icon={LayoutDashboard} title="Staff Portal" desc="Assign roles to trainers and receptionists with restricted access." />
          <FeatureCard icon={Zap} title="Smart Billing" desc="Automated invoicing with multiple payment gateway integrations." />
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-[#0d0d0d] to-[#080808] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="text-center mb-12 md:mb-16">
            <SectionTag>// See It In Action</SectionTag>
            <h2 className="text-2xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-4 md:mb-6 italic">
              Platform Walkthrough
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Get a first look at how GymPilotPro automates WhatsApp reminders, QR check-ins, billing, access control and member management — built specifically for Nigerian gym owners.
            </p>
          </div>

          <div className="max-w-4xl lg:max-w-5xl mx-auto rounded-none overflow-hidden border-2 border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative group">
            <div className="relative pb-[56.25%] h-0 overflow-hidden bg-background">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2400&auto=format&fit=crop"
                alt="GymPilotPro Dashboard Preview — Coming Soon"
                className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
                <div className="bg-orange-500/90 text-black font-black uppercase text-3xl sm:text-4xl md:text-5xl lg:text-6xl px-8 sm:px-10 md:px-12 py-3 md:py-4 tracking-tighter mb-4 md:mb-6 shadow-[0_0_30px_rgba(249,115,22,0.5)] transform group-hover:scale-105 transition-transform">
                  COMING SOON
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-medium max-w-xl text-foreground/90 drop-shadow-lg">
                  Full 3-minute demo video dropping shortly — showcasing your real GymPilotPro dashboard
                </p>
              </div>
              <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center border border-orange-500/40 group-hover:bg-orange-500/40 transition-colors">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center mt-10 md:mt-12">
            <p className="text-muted-foreground text-base sm:text-lg mb-6 md:mb-8">
              Video walkthrough in production — will show the actual clean, fast dashboard<br className="hidden sm:inline" />
              tailored for Lagos gyms (no bloat, no fluff).
            </p>
            <Button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-14 sm:h-16 px-8 sm:px-10 md:px-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-base sm:text-lg rounded-none shadow-lg shadow-orange-500/20"
            >
              Get Early Access Anyway <ChevronRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 lg:py-32 bg-[#080808]">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center">
          <SectionTag>// Trusted by Gym Owners</SectionTag>
          <h2 className="text-2xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-10 md:mb-12 italic">
            Real Results from Lagos Gym Leaders
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/[0.03] border border-orange-500/20 p-4 md:p-6 sm:p-8 md:p-10 rounded-none shadow-[0_0_30px_rgba(249,115,22,0.08)] relative">
              <Quote className="absolute -top-8 sm:-top-10 left-6 sm:left-10 text-orange-500/30 w-16 h-16 sm:w-20 sm:h-20" />
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 md:gap-8">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-orange-500/40 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
                    alt="Nere Emiko - Klimarx Space Gym"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed mb-4 md:mb-6 italic">
                    "GymPilotPro changed everything. The automated WhatsApp reminders alone recovered ₦1.2M in expired memberships in the first 3 months. No more chasing payments — now I focus on growth at Klimarx Space Gym."
                  </p>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-black uppercase text-orange-500 italic">
                      Nere Emiko
                    </h4>
                    <p className="text-muted-foreground font-bold text-xs sm:text-sm mt-1">
                      Owner, Klimarx Space Gym – Lagos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-base sm:text-lg md:text-xl font-medium mt-12 md:mt-16 max-w-2xl mx-auto">
              Helping gyms across Lagos eliminate revenue loss and grow faster. Join high-performance facilities using GymPilotPro.
            </p>

            <div className="mt-12 md:mt-16 h-16 sm:h-20 border-y border-border flex items-center justify-center opacity-30">
              <p className="text-xs sm:text-sm tracking-[0.5em] italic">More Industry Leaders Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 lg:py-32 bg-[#0d0d0d] border-y border-border relative overflow-hidden">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <SectionTag>// Pricing Plans</SectionTag>
            <h2 className="text-2xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-4 md:mb-6 italic">Scale Your Empire</h2>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8 md:mt-12 mb-6 md:mb-8">
              {DURATIONS.map((d) => (
                <button
                  key={d.months}
                  onClick={() => setSelectedMonths(d.months)}
                  className={cn(
                    "px-6 sm:px-8 py-2.5 sm:py-3 font-black text-xs sm:text-sm border-2 transition-all",
                    selectedMonths === d.months
                      ? "bg-orange-500 border-orange-500 text-foreground shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                      : "bg-transparent border-border text-muted-foreground hover:border-border"
                  )}
                >
                  {d.label}
                  {d.discount > 0 && <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs text-foreground/70">-{d.discount * 100}%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {(Object.keys(PLANS) as PlanKey[]).map((key) => {
              const p = PLANS[key]
              const isPopular = key === 'pro'
              const discountedMonthly = p.monthlyFee * (1 - currentDuration.discount)
              const totalSetupAndMonthly = p.setupFee + (discountedMonthly * selectedMonths)

              return (
                <div
                  key={key}
                  className={cn(
                    "p-4 md:p-6 sm:p-8 md:p-10 border-2 flex flex-col transition-all duration-500 relative group",
                    isPopular
                      ? "border-orange-500 bg-white/5 scale-100 md:scale-105 z-10 shadow-[0_0_40px_rgba(249,115,22,0.15)]"
                      : "border-border bg-background"
                  )}
                >
                  {isPopular && (
                    <span className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] sm:text-xs font-black px-5 sm:px-6 py-1.5 sm:py-2 shadow-xl">
                      Owner's Choice
                    </span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-black uppercase mb-2">{p.name}</h3>

                  <div className="my-6 sm:my-8 space-y-4">
                    <div className="p-3 sm:p-4 bg-white/5 border border-border group-hover:border-orange-500/30 transition-colors">
                      <p className="text-[10px] sm:text-xs font-black text-muted-foreground mb-1">Initial Access (Setup)</p>
                      <p className="text-2xl sm:text-3xl font-black tracking-tighter">₦{p.setupFee.toLocaleString()}</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-orange-500/5 border border-orange-500/20">
                      <p className="text-[10px] sm:text-xs font-black text-orange-500/70 mb-1">
                        {selectedMonths} Month{selectedMonths > 1 ? 's' : ''} Access
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tighter text-orange-500">
                          ₦{(discountedMonthly * selectedMonths).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground font-bold text-[10px] sm:text-xs">/{selectedMonths}MO</span>
                      </div>
                      {currentDuration.discount > 0 && (
                        <p className="text-[9px] sm:text-xs font-bold text-green-500 mt-1">
                          Includes {currentDuration.discount * 100}% multi-month discount
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-muted-foreground group-hover:text-gray-200 transition-colors">
                        <Check size={16} className="text-orange-500 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-border mb-6 sm:mb-8">
                    <p className="text-[10px] sm:text-xs font-black text-muted-foreground mb-1">Total to Unlock Access</p>
                    <p className="text-xl sm:text-2xl font-black tracking-tighter text-foreground">₦{totalSetupAndMonthly.toLocaleString()}</p>
                  </div>

                  <Button
                    disabled={loadingPlan !== null}
                    onClick={() => handlePayNow(key)}
                    className={cn(
                      "w-full h-14 sm:h-16 rounded-none font-black uppercase text-base sm:text-lg transition-all",
                      isPopular ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white hover:bg-orange-500 hover:text-foreground text-black"
                    )}
                  >
                    {loadingPlan === key ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Redirecting...</span>
                    ) : "Unlock Access"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-24 border-t border-border bg-[#080808]">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-8 md:mb-12 italic">
            Ready to fly <span className="text-orange-500 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">Pro?</span>
          </h2>
          <Button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-14 sm:h-16 md:h-20 px-10 sm:px-12 md:px-16 bg-white text-black font-black uppercase text-base sm:text-xl rounded-none hover:bg-orange-500 hover:text-foreground transition-all shadow-2xl"
          >
            Get GymPilotPro
          </Button>
          <div className="pt-10 md:pt-12 mt-16 md:mt-24 border-t border-border w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 md:gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/gympilotpro.png" 
                alt="GymPilotPro Logo" 
                width={120} 
                height={30} 
                className="h-6 sm:h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
              <span className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic">
                GymPilot<span className="text-orange-500">Pro</span>
              </span>
            </Link>
            <p className="text-xs sm:text-[10px] font-black tracking-[0.2em] text-muted-foreground italic">
              © 2026 GYMPILOTPRO SYSTEMS. RUN LIKE A PRO.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}