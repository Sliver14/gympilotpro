'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Users,
  Zap,
  ChevronRight,
  Check,
  MessageSquare,
  AlertCircle,
  Quote,
  ShieldCheck,
  Clock,
  TrendingUp,
  Smartphone,
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
import DemoBookingModal from './demo-booking-modal'

// Reusable Components
const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-orange-500 font-black tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 block italic">
    {children}
  </span>
)

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="group p-6 sm:p-8 rounded-none border-l-2 border-border bg-white/[0.02] backdrop-blur-sm hover:bg-orange-500/5 hover:border-orange-500 transition-all duration-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="mb-6 inline-block p-3 bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform relative z-10">
      <Icon className="w-8 h-8" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl sm:text-2xl font-black uppercase mb-3 tracking-tight relative z-10 italic text-white">
      {title}
    </h3>
    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium relative z-10">
      {desc}
    </p>
  </div>
)

export default function SaaSLandingClient() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-foreground selection:bg-orange-500 selection:text-black font-sans relative">
      <DemoBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-gradient-to-b from-black/95 to-transparent backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 h-20 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
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
          <div className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-black tracking-[0.2em] uppercase">
            <Link href="#features" className="hover:text-orange-500 transition-colors">Revenue System</Link>
            <Link href="#how-it-works" className="hover:text-orange-500 transition-colors">How It Works</Link>
            <Link href="#testimonials" className="hover:text-orange-500 transition-colors">Testimonials</Link>
            <Link href="/plans" className="hover:text-orange-500 transition-colors">Pricing</Link>
            <Button
              onClick={openModal}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-none px-8 py-6 shadow-[0_0_20px_rgba(249,115,22,0.3)] text-xs tracking-widest"
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
              className="w-full sm:max-w-xs bg-black border-l border-zinc-800 p-0 flex flex-col [&>button]:text-white [&>button]:opacity-100 [&>button]:right-8 [&>button]:top-8 [&>button]:scale-125"
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
                <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Revenue System</Link>
                <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">How It Works</Link>
                <Link href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Testimonials</Link>
                <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Pricing</Link>
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
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Premium Gym"
            className="w-full h-full object-cover opacity-50 grayscale"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]" />
        </div>

        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="max-w-4xl lg:max-w-5xl pt-8 lg:pt-0">
            <SectionTag>// Revenue Protection Infrastructure</SectionTag>

            <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase leading-[0.92] tracking-tight italic mb-6 sm:mb-8 px-1 text-white">
              Stop Losing Money <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-500/50 border-t-2 border-b-2 border-border pr-2">
                From Expired Members
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 sm:mb-14 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
              GymPilot Pro automatically tracks active members, sends payment reminders, and controls access—so you never lose revenue again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <Button
                onClick={openModal}
                className="h-16 sm:h-20 px-10 sm:px-12 bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl font-black uppercase rounded-none group shadow-[0_0_30px_rgba(249,115,22,0.3)]"
              >
                Book a 5-Minute Demo
                <ChevronRight className="ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>

              <Button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-16 sm:h-20 px-10 sm:px-12 text-foreground border-2 border-border hover:border-orange-500 hover:bg-orange-500/5 hover:text-foreground text-lg sm:text-xl font-black uppercase rounded-none bg-white/5 backdrop-blur-sm"
              >
                See How It Works
              </Button>
            </div>

            <p className="mt-10 text-muted-foreground text-sm sm:text-base font-bold tracking-widest uppercase italic flex items-center gap-2 justify-center lg:justify-start">
              <ShieldCheck className="text-orange-500" size={20} />
              Trusted by growing gyms to recover lost revenue
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-20 md:py-28 lg:py-32 bg-[#080808] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/[0.03] border border-orange-500/20 p-6 sm:p-10 md:p-16 rounded-none shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <Quote className="absolute -top-10 -left-10 text-orange-500/10 w-40 h-40" />
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-none overflow-hidden border-4 border-orange-500/40 flex-shrink-0 rotate-3">
                  <img
                    src="https://scontent-ams2-1.xx.fbcdn.net/v/t51.82787-15/610751846_18392849944198542_3473965281649504635_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeGdqwPfdCXlJV6dGu3AmTdiBcJAqDJOKegFwkCoMk4p6M20Zzrf2OugEbYaj7S14BVB4Xp605r7qT9RJb47XTD1&_nc_ohc=mwMuZMyTYK4Q7kNvwHEdlCM&_nc_oc=Adpr6JJokv0oq_gDZZ35sqxRkZ8czxBkIm4AhI5rqHPM5P73DpVofhVKCFUNXtEYGW0&_nc_zt=23&_nc_ht=scontent-ams2-1.xx&_nc_gid=JH8u3g9N0YBGrzlSYY7p0w&_nc_ss=7b2a8&oh=00_Af7Xpo7qPhuadpaauH6iQMPaET3gJMdoioE1a4xX0mfEig&oe=69FBDBE4"
                    alt="Nere Emiko - Klimarx Space Gym"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl sm:text-2xl md:text-4xl font-black uppercase italic leading-[1.1] mb-8 pr-4 text-white">
                    "In just 3 months, we recovered over <span className="text-orange-500 underline decoration-2 underline-offset-4 md:underline-offset-8 pr-2">₦1.2M in expired memberships</span> using GymPilot Pro."
                  </p>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-xl sm:text-2xl font-black uppercase text-orange-500 italic">Nere Emiko</h4>
                      <p className="text-muted-foreground font-bold text-xs sm:text-sm tracking-widest mt-1 uppercase">Owner, Klimarx Space Gym</p>
                    </div>
                    <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-widest">
                      Automated reminders + better tracking = more revenue
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-[#080808] to-[#0d0d0d]">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row gap-4 md:gap-16 items-start mb-16 md:mb-24">
            <div className="flex-1">
              <SectionTag>// Revenue Leakage</SectionTag>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight italic text-white">
                Your Gym Is <br /><span className="text-orange-500 pr-2">Leaking Revenue</span> Every Month
              </h2>
            </div>
            <div className="flex-1 mt-6 md:mt-0">
              <p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-lg mb-8">
                This isn’t a management problem—it’s a system problem. Manual tracking is costing you hundreds of thousands in unpaid sessions.
              </p>
              <Button onClick={openModal} variant="link" className="text-orange-500 p-0 h-auto font-black uppercase tracking-widest italic group">
                Stop the bleed now <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-white/5 p-1 border border-border">
            {[
              { title: "Invisible Expiries", desc: "Members continue training after plans expire because staff miss the dates." },
              { title: "Manual Chasing", desc: "Staff waste hours manually chasing payments on WhatsApp with no success." },
              { title: "Access Chaos", desc: "No way to stop non-paying members at the door without awkward confrontations." },
              { title: "Zero Visibility", desc: "No real-time data on who has paid, who is active, and how much you're losing." }
            ].map((item, i) => (
              <div key={i} className="bg-background p-8 md:p-10 hover:bg-orange-500/5 transition-colors group">
                <AlertCircle className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                <h4 className="text-xl font-black uppercase mb-4 italic text-white">{item.title}</h4>
                <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-[#0d0d0d] border-y border-border">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="max-w-4xl">
            <SectionTag>// The Solution</SectionTag>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight italic mb-8 text-white">
              GymPilot Pro Fixes This <span className="text-orange-500 pr-2">Automatically</span>
            </h2>
            <p className="text-xl md:text-3xl text-foreground font-medium leading-tight mb-12">
              GymPilot Pro is your gym’s revenue protection system. It tracks every member, automates reminders, and ensures only active members can access your gym.
            </p>
            <Button
              onClick={openModal}
              className="h-16 sm:h-20 px-10 sm:px-16 bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-2xl font-black uppercase rounded-none"
            >
              Protect My Revenue
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 bg-[#080808]">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="text-center mb-16 md:mb-24">
            <SectionTag>// Operations Flow</SectionTag>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter italic text-white">Simple. Automated. Effective.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />

            {[
              {
                step: "01",
                title: "Members Sign Up & Pay",
                desc: "Every member is registered in the system with their payment and plan details stored securely."
              },
              {
                step: "02",
                title: "System Tracks & Reminds",
                desc: "The system automatically monitors expiry dates and sends WhatsApp reminders BEFORE they expire."
              },
              {
                step: "03",
                title: "QR Access Control",
                desc: "Staff scan QR codes at entry. If the plan is expired, access is denied. No active plan? No entry."
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-background border-2 border-orange-500 text-orange-500 flex items-center justify-center text-2xl sm:text-3xl font-black italic mb-8 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  {item.step}
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 italic text-white">{item.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#080808] to-[#0d0d0d] border-t border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionTag>// Results Driven</SectionTag>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic mb-8 text-white">
                Built for Gym Owners <br />Who Want to <span className="text-orange-500 pr-2">Scale</span>
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Recover Lost Revenue", desc: "Stop letting non-paying members use your facilities for free." },
                  { title: "Save Staff Time", desc: "Eliminate hours of manual tracking and chasing payments." },
                  { title: "Professional Operation", desc: "Impressionate members with a modern, high-tech entry system." },
                  { title: "Real-Time Visibility", desc: "Know exactly how many active members you have at any second." }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4 p-4 border-l-2 border-orange-500/20 hover:border-orange-500 transition-colors bg-white/5">
                    <Check className="text-orange-500 shrink-0 mt-1" size={20} strokeWidth={3} />
                    <div>
                      <h4 className="font-black uppercase italic text-lg text-white">{benefit.title}</h4>
                      <p className="text-muted-foreground text-sm font-medium">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-orange-500/10 border-2 border-orange-500/20 p-8 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="text-orange-500 w-24 h-24 mx-auto mb-6" strokeWidth={1.5} />
                  <p className="text-5xl font-black italic uppercase mb-2 text-white">+25%</p>
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Average Revenue Increase</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-6 font-black uppercase italic tracking-tighter">
                NO MORE <br />LEAKAGE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center mb-16 md:mb-24">
          <SectionTag>// System Capabilities</SectionTag>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter italic text-white">Outcome-Based Features</h2>
        </div>
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={Users} title="Smart Member Tracking" desc="Know exactly who is active, who is expired, and who is about to quit in real-time." />
          <FeatureCard icon={MessageSquare} title="WhatsApp Reminders" desc="Automated messages sent to members before they expire to ensure seamless renewal." />
          <FeatureCard icon={Smartphone} title="QR Access Control" desc="Enforce entry rules at the door. No manual checking needed—the system does it for you." />
          <FeatureCard icon={BarChart3} title="Real-Time Dashboard" desc="Track your MRR, daily attendance, and revenue growth from any device, anywhere." />
        </div>
      </section>

      {/* Objection Handling */}
      <section className="py-20 md:py-32 bg-[#0d0d0d] border-y border-border">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 text-center">
          <SectionTag>// Ease of Use</SectionTag>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 text-white">No Tech Skills Needed</h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium mb-12">
            We handle the setup for you. Your gym is fully configured with your members and plans before you even start. You just log in and watch your revenue grow.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-500" />
              <span className="font-black uppercase italic text-white">24-Hour Setup</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-orange-500" />
              <span className="font-black uppercase italic text-white">Free Staff Training</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="text-orange-500" />
              <span className="font-black uppercase italic text-white">Instant Activation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter italic text-white mb-8">
            Ready to Stop <br />Revenue Loss?
          </h2>
          <Button
            onClick={openModal}
            className="h-16 sm:h-24 px-12 sm:px-20 bg-white text-black hover:bg-black hover:text-white text-xl sm:text-3xl font-black uppercase rounded-none transition-all shadow-2xl"
          >
            Book a 5-Minute Demo
          </Button>
          <p className="mt-8 text-white/90 font-bold uppercase tracking-[0.2em] italic">
            We’ll walk you through everything and show how it fits your gym.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-24 border-t border-border bg-[#080808]">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-3 group mb-6" onClick={() => setIsMobileMenuOpen(false)}>
                <Image
                  src="/gympilotpro.png"
                  alt="GymPilotPro Logo"
                  width={160}
                  height={40}
                  className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                  priority
                />
                <span className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic text-white">
                  GymPilot<span className="text-orange-500">Pro</span>
                </span>
              </Link>
              <p className="text-muted-foreground font-medium mb-6">
                GymPilot Pro gives you the systems needed to operate like a professional gym business, not a manual operation.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="font-black uppercase italic text-orange-500">Platform</h4>
                <ul className="space-y-2 text-sm font-bold text-muted-foreground">
                  <li><button onClick={openModal} className="hover:text-white transition-colors">Book Demo</button></li>
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-white transition-colors">Operations</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-black uppercase italic text-orange-500">Contact</h4>
                <ul className="space-y-2 text-sm font-bold text-muted-foreground">
                  <li>Lagos, Nigeria</li>
                  <li>hello@gympilotpro.com</li>
                  <li>+234 806 1731 600</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-border w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-black tracking-[0.2em] text-muted-foreground italic uppercase">
              © 2026 GYMPILOTPRO SYSTEMS. RUN LIKE A PRO.
            </p>
            <div className="flex gap-8 text-[10px] font-black tracking-widest uppercase text-muted-foreground">
              <Link href="#" className="hover:text-orange-500">Privacy Policy</Link>
              <Link href="#" className="hover:text-orange-500">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
