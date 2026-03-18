'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
  Quote // ← added for testimonial icon
} from 'lucide-react'

// --- Reusable Styled Components ---

const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-orange-500 font-black italic uppercase tracking-[0.2em] text-sm mb-4 block">
    {children}
  </span>
)

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="group p-8 rounded-none border-l-2 border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-orange-500/5 hover:border-orange-500 transition-all duration-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="mb-6 inline-block p-3 bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform relative z-10">
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-2xl font-black italic uppercase mb-3 tracking-tight relative z-10">
      {title}
    </h3>
    <p className="text-gray-400 leading-relaxed font-medium relative z-10">
      {desc}
    </p>
  </div>
)

export default function SaaSLandingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const handlePayNow = (plan: any) => {
    setLoadingPlan(plan.name);
    router.push(`/get-started?plan=${plan.name.toLowerCase()}`);
  };

  const plans = [
    { 
      name: "Starter", 
      setupFee: "150,000",
      monthlyFee: "12,000",
      features: ["Up to 200 Members", "WhatsApp Reminders", "Basic Gym Dashboard", "QR Check-in"],
      popular: false
    },
    { 
      name: "Pro", 
      setupFee: "210,000",
      monthlyFee: "18,000",
      features: ["Up to 500 Members", "Custom Subdomain", "Full Automation Features", "Detailed Analytics"], 
      popular: true 
    },
    { 
      name: "Elite", 
      setupFee: "450,000",
      monthlyFee: "35,000",
      features: ["Unlimited Members", "Custom Domain", "Priority Support", "Multi-branch Support", "Advanced Analytics"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-orange-500 selection:text-black font-sans relative">
      
      {/* --- Navigation --- */}
      <nav className="absolute top-0 w-full z-[100] bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              GymPilot<span className="text-orange-500">Pro</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em]">
            <Link href="#features" className="hover:text-orange-500 transition-colors">Platform</Link>
            <Link href="#demo" className="hover:text-orange-500 transition-colors">Demo</Link>
            <Link href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</Link>
            <Button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black italic rounded-none px-8 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              GET STARTED
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
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

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl">
            <SectionTag>// Performance Infrastructure</SectionTag>
            <h1 className="text-6xl md:text-9xl font-black italic uppercase leading-[0.85] mb-8 tracking-tighter">
              Run Your Gym <br />
              <span className="text-transparent border-t border-b border-white/20 bg-clip-text bg-gradient-to-r from-white via-white to-orange-500/50">
                Like A Pro
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-medium leading-relaxed">
              Stop losing money from expired members. Automate your gym and get paid on time, every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-20 px-12 bg-orange-500 text-white hover:bg-orange-600 transition-all text-xl font-black italic uppercase rounded-none group"
              >
                Start Your Journey <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                asChild
                variant="outline" 
                className="h-20 px-12 border-2 border-white/20 hover:border-orange-500/50 text-xl font-black italic uppercase rounded-none bg-white/5 backdrop-blur-sm"
              >
                <Link href="#features">Explore Platform</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Problem Section --- */}
      <section className="py-32 bg-gradient-to-b from-[#080808] to-[#0d0d0d] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-end mb-20">
            <div className="flex-1">
              <SectionTag>// The Problem</SectionTag>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
                Manual Management <br /><span className="text-orange-500">Kills Growth</span>
              </h2>
            </div>
            <p className="flex-1 text-gray-500 text-xl font-medium max-w-md">
              Inconsistent tracking leads to revenue leakage. If you aren't automating, you're leaving money on the gym floor.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-1 bg-white/5 p-1 border border-white/10">
            {[
              { title: "Expired Access", desc: "Non-paying members slipping through the cracks daily." },
              { title: "Zero Data", desc: "Flying blind without real-time profit and churn analytics." },
              { title: "Manual Chaos", desc: "Drowning in paper logs and fragmented WhatsApp messages." },
              { title: "Retention Loss", desc: "No automated system to bring members back before they quit." }
            ].map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] p-10 hover:bg-orange-500/5 transition-colors">
                <AlertCircle className="text-orange-500 mb-6" size={32} />
                <h4 className="text-xl font-black italic uppercase mb-4">{item.title}</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-6 text-center mb-24">
          <SectionTag>// Command & Control</SectionTag>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Pro-Grade Tools</h2>
        </div>
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-6">
          <FeatureCard icon={Users} title="Access Control" desc="QR and Biometric integration to ensure only active members enter." />
          <FeatureCard icon={MessageSquare} title="Auto-Pilot Comms" desc="Automatically send WhatsApp reminders before memberships expire — so you never miss payments again." />
          <FeatureCard icon={BarChart3} title="Deep Analytics" desc="Track MRR, peak hours, and trainer performance at a glance." />
          <FeatureCard icon={Globe} title="Cloud Sync" desc="Manage multiple branches from a single, unified owner dashboard." />
          <FeatureCard icon={LayoutDashboard} title="Staff Portal" desc="Assign roles to trainers and receptionists with restricted access." />
          <FeatureCard icon={Zap} title="Smart Billing" desc="Automated invoicing with multiple payment gateway integrations." />
        </div>
      </section>

      {/* --- Video Demo Section --- */}
      <section id="demo" className="py-32 bg-gradient-to-b from-[#0d0d0d] to-[#080808] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <SectionTag>// See It In Action</SectionTag>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
              3-Minute Platform Walkthrough
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium">
              Watch how GymPilotPro automates WhatsApp reminders, QR check-ins, billing, and member management — 
              so you stop losing revenue and start scaling like a pro.
            </p>
          </div>

          <div className="max-w-5xl mx-auto rounded-none overflow-hidden border-2 border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)]">
            <div className="relative pb-[56.25%] h-0 overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/C6RiuPWLwCY?rel=0&modestbranding=1&showinfo=0"
                title="Gym Management Software Demo - Similar to GymPilotPro"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 italic text-lg mb-8">
              This is a representative demo of a similar gym management system.<br/>
              Your GymPilotPro dashboard is cleaner, faster, and built specifically for Nigerian gyms.
            </p>
            <Button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-16 px-12 bg-orange-500 hover:bg-orange-600 text-white font-black italic uppercase text-lg rounded-none shadow-lg shadow-orange-500/20"
            >
              Get Your Live Access <ChevronRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* --- Updated Trust / Testimonials Section --- */}
      <section className="py-32 bg-[#080808]">
        <div className="container mx-auto px-6 text-center">
          <SectionTag>// Trusted by Gym Owners</SectionTag>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-12">
            Real Results from Lagos Gym Leaders
          </h2>

          <div className="max-w-4xl mx-auto">
            {/* Testimonial Card for Nere Emiko */}
            <div className="bg-white/[0.03] border border-orange-500/20 p-10 rounded-none shadow-[0_0_30px_rgba(249,115,22,0.08)] relative">
              <Quote className="absolute -top-6 left-10 text-orange-500/30" size={80} />
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Placeholder photo – replace with real one */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500/40 flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                    alt="Nere Emiko - Klimarx Space Gym" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="text-left">
                  <p className="text-xl md:text-2xl text-gray-300 font-medium italic leading-relaxed mb-6">
                    "GymPilotPro changed everything. The automated WhatsApp reminders alone recovered ₦1.2M in expired memberships in the first 3 months. No more chasing payments — now I focus on growth at Klimarx Space Gym."
                  </p>
                  <div>
                    <h4 className="text-2xl font-black italic uppercase text-orange-500">
                      Nere Emiko
                    </h4>
                    <p className="text-gray-400 font-bold uppercase text-sm tracking-wider mt-1">
                      Owner, Klimarx Space Gym – Lagos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional: Add more testimonials later */}
            <p className="text-gray-500 text-xl font-medium mt-16 max-w-2xl mx-auto italic">
              Helping gyms across Lagos eliminate revenue loss and grow faster. Join high-performance facilities using GymPilotPro.
            </p>

            {/* Placeholder for future logos/testimonials grid */}
            <div className="mt-16 h-20 border-y border-white/5 flex items-center justify-center opacity-30">
              <p className="italic text-sm tracking-[0.5em] uppercase">More Industry Leaders Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" className="py-32 bg-[#0d0d0d] border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <SectionTag>// Pricing Plans</SectionTag>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">Scale Your Empire</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium italic">
              "One recovered member can cover your monthly fee. Everything else is profit."
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((p, i) => (
              <div key={i} className={cn(
                "p-10 border-2 flex flex-col transition-all duration-500 relative group", 
                p.popular ? "border-orange-500 bg-white/5 lg:scale-105 z-10 shadow-[0_0_50px_rgba(249,115,22,0.1)]" : "border-white/10 bg-[#0a0a0a]"
              )}>
                {p.popular && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-6 py-2 uppercase italic tracking-widest shadow-xl">
                    Owner's Choice
                  </span>
                )}
                <h3 className="text-3xl font-black italic uppercase mb-2">{p.name}</h3>
                
                <div className="my-8 space-y-4">
                  <div className="p-4 bg-white/5 border border-white/5 group-hover:border-orange-500/30 transition-colors">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Setup Fee</p>
                    <p className="text-3xl font-black italic tracking-tighter">₦{p.setupFee}</p>
                  </div>
                  <div className="p-4 bg-orange-500/5 border border-orange-500/20">
                    <p className="text-[10px] font-black uppercase text-orange-500/70 mb-1 tracking-widest">Monthly</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black italic tracking-tighter text-orange-500">₦{p.monthlyFee}</span>
                      <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">/MO</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-bold uppercase text-gray-400 group-hover:text-gray-200 transition-colors">
                      <Check size={18} className="text-orange-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  disabled={loadingPlan !== null}
                  onClick={() => handlePayNow(p)}
                  className={cn(
                    "w-full h-16 rounded-none font-black italic uppercase text-lg transition-all", 
                    p.popular ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white hover:bg-orange-500 hover:text-white text-black"
                  )}
                >
                  {loadingPlan === p.name ? (
                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Redirecting...</span>
                  ) : "Unlock Access"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-24 border-t border-white/5 bg-[#080808]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-12">
            Ready to fly <span className="text-orange-500 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">Pro?</span>
          </h2>
          <Button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="h-20 px-16 bg-white text-black font-black italic uppercase text-xl rounded-none hover:bg-orange-500 hover:text-white transition-all shadow-2xl">
            Get GymPilotPro
          </Button>
          <div className="pt-12 mt-24 border-t border-white/5 w-full flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              GymPilot<span className="text-orange-500">Pro</span>
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">© 2026 GYMPILOTPRO SYSTEMS. RUN LIKE A PRO.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}