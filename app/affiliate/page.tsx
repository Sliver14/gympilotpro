'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, DollarSign, Users, Award, ShieldCheck, Check, HelpCircle, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AffiliateLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const steps = [
    {
      title: "Sign Up",
      description: "Register as an affiliate in 2 minutes, and get your unique referral code instantly.",
      badge: "STEP 01"
    },
    {
      title: "Share",
      description: "Send your unique referral link to gym owners who need high-performance management software.",
      badge: "STEP 02"
    },
    {
      title: "They Sign Up",
      description: "When a gym owner registers using your code, they're linked to you in the database automatically.",
      badge: "STEP 03"
    },
    {
      title: "You Get Paid",
      description: "Earn commission on their setup fee and 6 months of their monthly subscription recurring revenue.",
      badge: "STEP 04"
    }
  ]

  const plans = [
    { name: "Starter", setup: "₦6,000", monthly: "₦3,000/mo", total: "~₦24,000" },
    { name: "Pro", setup: "₦10,000", monthly: "₦5,000/mo", total: "~₦40,000", popular: true },
    { name: "Elite", setup: "₦20,000", monthly: "₦9,000/mo", total: "~₦74,000" }
  ]

  const faqs = [
    {
      q: "Does it cost anything to become an affiliate?",
      a: "No, it's completely free to join. There are no hidden fees, minimum sales requirements, or costs to maintain your status."
    },
    {
      q: "How do I get paid?",
      a: "Commissions are currently tracked on your personal dashboard and processed manually. Payouts are made directly to your registered bank account on a regular schedule."
    },
    {
      q: "How long do I earn commission on a referral?",
      a: "You earn a one-time 20% commission on the setup fee when the gym first registers and activates, plus a recurring 20% on their subscription payments for their first 6 months."
    },
    {
      q: "Is there a limit to how many gyms I can refer?",
      a: "Absolutely not. You can refer as many gym owners, managers, or coaches as you want. The more gyms you refer, the more you earn."
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-black font-sans flex flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black uppercase tracking-tighter">
              Gympilot<span className="text-orange-500">Pro</span> <span className="text-[10px] font-black uppercase text-orange-500 border border-orange-500/20 px-1.5 py-0.5 ml-1">PARTNER</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/affiliate/login"
              className="text-xs font-black tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase"
            >
              LOG IN
            </Link>
            <Button
              asChild
              className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[11px] tracking-widest rounded-none hidden sm:inline-flex"
            >
              <Link href="/affiliate/signup">JOIN NOW</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90svh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2070&auto=format&fit=crop"
            alt="Gym Partnership"
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.1),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-background to-background" />
        </div>

        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-none mb-6">
            <Sparkles size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 italic">
              GymPilotPro Partner Protocol
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] tracking-tight italic mb-8 text-white">
            Earn Money Helping <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-500/80 border-b-4 border-orange-500">
              Gyms Grow
            </span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Know a gym owner? Refer them to Gym Pilot Pro and earn <span className="text-white font-black">20% commission</span> on every signup — both setup fee plus 6 months of recurring monthly revenue. Free to join.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="h-16 sm:h-20 px-10 sm:px-16 bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl font-black uppercase rounded-none group shadow-[0_0_40px_rgba(249,115,22,0.25)]"
            >
              <Link href="/affiliate/signup">
                Become an Affiliate
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
            <Button
              onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-16 sm:h-20 px-10 sm:px-16 text-foreground border-2 border-border hover:border-orange-500 hover:bg-orange-500/5 text-lg sm:text-xl font-black uppercase rounded-none bg-white/5 backdrop-blur-sm"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section id="details" className="py-20 md:py-32 bg-[#0a0a0a] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-orange-500 font-black tracking-[0.2em] text-xs mb-3 block uppercase italic">
              // Partner Alignment
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white">
              Who This Is For
            </h2>
            <p className="text-muted-foreground mt-4 font-medium">
              If you have connections in the fitness industry, this program is designed for you.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {["Gym Owners", "Gym Managers", "Personal Trainers", "Fitness Coaches", "Industry Influencers"].map((target, idx) => (
              <div key={idx} className="bg-card border border-border p-6 sm:p-8 flex flex-col justify-between hover:border-orange-500/30 transition-colors">
                <span className="text-orange-500 font-black text-xs block mb-4 uppercase">0{idx + 1}</span>
                <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight text-white italic">{target}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
            <span className="text-orange-500 font-black tracking-[0.2em] text-xs mb-3 block uppercase italic">
              // Operational Protocol
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="border border-border bg-card/20 p-6 sm:p-8 space-y-4 hover:border-orange-500/30 transition-colors">
                <span className="text-orange-500 font-black tracking-widest text-[9px] uppercase italic block">
                  {step.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">{step.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout Models (What You Earn) */}
      <section className="py-20 md:py-32 bg-[#0a0a0a] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-black tracking-[0.2em] text-xs mb-3 block uppercase italic">
              // Commission Structure
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white mb-4">
              What You Earn
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-sm sm:text-base">
              Get paid a massive 20% flat rate cut of setup onboarding fees, plus a 20% monthly subscription payout for 6 months.
            </p>
          </div>

          <div className="overflow-x-auto border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-500">Plan</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-500">Setup Fee (20%)</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-500">Monthly Recurring (20%)</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-500">Total Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((p, idx) => (
                  <tr key={idx} className={cn("hover:bg-white/[0.02] transition-colors", p.popular && "bg-orange-500/5")}>
                    <td className="p-4 sm:p-6 font-black uppercase text-sm sm:text-lg italic text-white flex items-center gap-2">
                      {p.name}
                      {p.popular && <span className="bg-orange-500 text-[8px] font-bold tracking-widest text-black px-1.5 py-0.5 rounded-none uppercase scale-90">Popular</span>}
                    </td>
                    <td className="p-4 sm:p-6 text-sm font-bold text-zinc-300">{p.setup}</td>
                    <td className="p-4 sm:p-6 text-sm font-bold text-zinc-300">{p.monthly} <span className="text-zinc-500 font-medium">x 6 months</span></td>
                    <td className="p-4 sm:p-6 text-sm sm:text-lg font-black text-emerald-500">{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-xs font-black uppercase tracking-widest text-muted-foreground italic">
            The more gyms you refer, the more you earn — no limit on referrals.
          </p>
        </div>
      </section>

      {/* Why Gym Pilot Pro */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 font-black tracking-[0.2em] text-xs mb-3 block uppercase italic">
                // System Value
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white mb-6">
                Why Gym Pilot Pro?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed mb-6">
                Gym Pilot Pro is the revenue protection standard. We help gym owners automate expired memberships notifications, process online subscriptions via Paystack, and control branch access. It's incredibly easy to pitch because it solves a critical profit leak gym owners face daily.
              </p>
              <div className="space-y-3">
                {["Automated Member Check-ins", "Flexible Subscriptions & Renewals", "Multi-Branch Support", "Revenue Recovery Logs"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="text-orange-500 w-4 h-4" strokeWidth={3} />
                    <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wide">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-border bg-card/40 p-8 space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-orange-500/5 opacity-5 pointer-events-none" />
              <h3 className="font-black text-white uppercase tracking-tight text-xl italic">// Track Everything</h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                As an affiliate partner, you get a clean dashboard panel where you can monitor your referral code, track gym signups, see their active/expired status, and review outstanding payout balances.
              </p>
              <Button asChild className="w-full h-12 bg-white text-black hover:bg-black hover:text-white uppercase font-black tracking-wider text-xs rounded-none">
                <Link href="/affiliate/signup">View Partner Panel</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 md:py-32 bg-[#0a0a0a] border-t border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-black tracking-[0.2em] text-xs mb-3 block uppercase italic">
              // FAQ Protocol
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white">
              Questions & Answers
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="border border-border bg-card/20 rounded-none overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between font-black uppercase text-xs sm:text-sm tracking-wide text-white hover:bg-white/[0.02] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn("w-4 h-4 text-orange-500 transition-transform duration-300", isOpen && "rotate-185")} />
                  </button>
                  {isOpen && (
                    <div className="p-6 pt-0 border-t border-border/50 text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed animate-in fade-in duration-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic text-white mb-8">
            Ready to Start <br />Earning?
          </h2>
          <Button
            asChild
            className="h-16 sm:h-24 px-12 sm:px-20 bg-white text-black hover:bg-black hover:text-white text-lg sm:text-2xl font-black uppercase rounded-none transition-all shadow-2xl"
          >
            <Link href="/affiliate/signup">Become a Partner Now</Link>
          </Button>
          <p className="mt-8 text-white/90 font-bold uppercase tracking-[0.2em] italic text-xs sm:text-sm">
            Join the Gym Pilot Pro Affiliate Network. Free Activation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-lg font-black uppercase tracking-tighter text-white">
              Gympilot<span className="text-orange-500">Pro</span>
            </span>
          </Link>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            © 2026 GYMPILOTPRO SYSTEMS • PARTNERSHIP DIVISION
          </p>
        </div>
      </footer>
    </div>
  )
}
