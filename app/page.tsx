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
  ArrowRight,
  AlertCircle,
  Play,
  X,
  Loader2
} from 'lucide-react'

// --- Reusable Styled Components ---

const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-orange-500 font-black italic uppercase tracking-[0.2em] text-sm mb-4 block">
    // {children}
  </span>
)

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="group p-8 rounded-none border-l-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-orange-500 transition-all duration-300">
    <div className="mb-6 inline-block p-3 bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-2xl font-black italic uppercase mb-3 tracking-tight">
      {title}
    </h3>
    <p className="text-gray-400 leading-relaxed font-medium">
      {desc}
    </p>
  </div>
)

export default function SaaSLandingPage() {
  const router = useRouter();
  
  // Checkout State
  const handlePayNow = (plan: any) => {
    router.push(`/get-started?plan=${plan.name.toLowerCase()}`);
  };

  const plans = [
    { 
      name: "Starter", 
      setupFee: "150,000",
      monthlyFee: "12,000",
      totalInitial: 162000,
      features: ["Up to 200 Members", "WhatsApp Reminders", "Basic Gym Dashboard", "QR Check-in"],
      popular: false
    },
    { 
      name: "Pro", 
      setupFee: "210,000",
      monthlyFee: "18,000",
      totalInitial: 228000,
      features: ["Up to 500 Members", "Custom Subdomain (yourgym.app.com)", "Full Automation Features", "Detailed Analytics"], 
      popular: true 
    },
    { 
      name: "Elite", 
      setupFee: "450,000",
      monthlyFee: "35,000",
      totalInitial: 485000,
      features: ["Unlimited Members", "Custom Domain (yourgym.com)", "Priority Support", "Multi-branch Support", "Advanced Analytics"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500 selection:text-black font-sans relative">
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-[100] bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              Insight<span className="text-orange-500">Gym</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em]">
            <Link href="#features" className="hover:text-orange-500 transition-colors">Platform</Link>
            <Link href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</Link>
            <Button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-500 hover:bg-orange-600 text-black font-black italic rounded-none px-8"
            >
              GET STARTED
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section with Background Image --- */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
            alt="Premium Gym Environment" 
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl">
            <SectionTag>Performance Management</SectionTag>
            <h1 className="text-6xl md:text-9xl font-black italic uppercase leading-[0.85] mb-8 tracking-tighter">
              Run Your Gym Like <br />
              <span className="text-transparent border-t-2 border-b-2 border-white/20 bg-clip-text bg-gradient-to-r from-white to-gray-500">
                A Business
              </span>, Not a Struggle
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-medium leading-relaxed">
              Stop losing money from expired memberships. Automate your gym and increase your revenue with our high-performance infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-20 px-12 bg-white text-black hover:bg-orange-500 transition-colors text-xl font-black italic uppercase rounded-none group"
              >
                View Plans <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                asChild
                variant="outline" 
                className="h-20 px-12 border-2 border-white/20 hover:border-white text-xl font-black italic uppercase rounded-none bg-[#0a0a0a]/50"
              >
                <Link href="#demo-video">Watch Video Guide</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Problem Section --- */}
      <section className="py-32 bg-[#0d0d0d] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-end mb-20">
            <div className="flex-1">
              <SectionTag>The Problem</SectionTag>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
                You're Losing <br /><span className="text-orange-500">Money Every Day</span>
              </h2>
            </div>
            <p className="flex-1 text-gray-500 text-xl font-medium max-w-md">
              Managing a gym manually isn't just stressful—it's expensive. Inefficient tracking leads to revenue leakage that kills growth.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-1">
            {[
              { title: "Expired Memberships", desc: "Members forget to renew and keep coming back for free." },
              { title: "Zero Visibility", desc: "No real-time data on who has paid and who is overdue." },
              { title: "Tracking Stress", desc: "Drowning in spreadsheets and manual attendance books." },
              { title: "Insight Gap", desc: "No idea which hours or trainers are actually profitable." }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 p-10 border border-white/5">
                <AlertCircle className="text-orange-500 mb-6" size={32} />
                <h4 className="text-xl font-black italic uppercase mb-4">{item.title}</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="py-32">
        <div className="container mx-auto px-6 text-center mb-24">
          <SectionTag>Core Capabilities</SectionTag>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Built for Growth</h2>
        </div>
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-6">
          <FeatureCard icon={Users} title="Member Control" desc="Digital check-ins via QR or fingerprint to prevent unauthorized entry." />
          <FeatureCard icon={MessageSquare} title="WhatsApp Reminders" desc="Automated renewal alerts sent directly to member's phones." />
          <FeatureCard icon={BarChart3} title="Revenue Analytics" desc="Comprehensive financial reports including MRR and churn rate." />
          <FeatureCard icon={Globe} title="Multi-Tenant" desc="Run multiple branches under one master account independently." />
          <FeatureCard icon={LayoutDashboard} title="Admin Dashboard" desc="A command center for owners to manage staff and memberships." />
          <FeatureCard icon={Zap} title="Instant Billing" desc="Automated invoicing and payment tracking for all memberships." />
        </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" className="py-32 bg-[#0d0d0d] border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <SectionTag>Pricing Plans</SectionTag>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Invest in Growth</h2>
            <p className="text-gray-400 text-xl font-medium mt-6">Choose the perfect plan to scale your fitness business.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((p, i) => (
              <div key={i} className={cn("p-10 border-2 flex flex-col transition-all duration-300", p.popular ? "border-orange-500 bg-white/5 lg:scale-105 relative z-10 shadow-2xl shadow-orange-500/10" : "border-white/10 hover:border-white/30 bg-[#0a0a0a]")}>
                {p.popular && <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black px-6 py-2 uppercase italic tracking-widest">Most Popular</span>}
                <h3 className="text-3xl font-black italic uppercase mb-2 text-white">{p.name}</h3>
                
                <div className="my-8 flex flex-col gap-4">
                  <div className="p-4 bg-white/5 border border-white/10">
                    <p className="text-sm font-bold uppercase text-gray-500 mb-1">One-Time Setup Fee</p>
                    <p className="text-3xl font-black italic tracking-tighter text-white">₦{p.setupFee}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10">
                    <p className="text-sm font-bold uppercase text-gray-500 mb-1">Monthly Subscription</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black italic tracking-tighter text-orange-500">₦{p.monthlyFee}</span>
                      <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">/MO</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-5 mb-10 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-bold uppercase text-gray-300 leading-snug">
                      <Check size={20} className="text-orange-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handlePayNow(p)}
                  className={cn("w-full h-16 rounded-none font-black italic uppercase text-lg transition-transform active:scale-95", p.popular ? "bg-orange-500 hover:bg-orange-600 text-black" : "bg-white hover:bg-gray-200 text-black")}
                >
                  {p.popular ? "Get Started Now" : "Pay Now"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-12">
            Stop Managing Your Gym <span className="text-orange-500">Manually.</span>
          </h2>
          <Button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="h-20 px-16 bg-white text-black font-black italic uppercase text-xl rounded-none hover:bg-orange-500 transition-colors mb-12">
            Get Started Now
          </Button>
          <div className="pt-12 border-t border-white/5 w-full flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-2xl font-black italic uppercase tracking-tighter">Insight<span className="text-orange-500">Gym</span></span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">© 2026 INSIGHT AUTOMATED GYM.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
