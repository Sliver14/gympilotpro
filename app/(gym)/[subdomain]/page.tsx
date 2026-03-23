'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useGym } from '@/components/gym-provider'
import { getGymBranding } from '@/lib/gym-branding'
import {
  Users,
  TrendingUp,
  CheckCircle,
  Play,
  Dumbbell,
  Trophy,
  MapPin,
  ChevronDown,
  ChevronUp,
  Lock,
  Mail,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react'

export default function GymLandingPage() {
  const { gymData, isLoading } = useGym()
  const [showAll, setShowAll] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const packages = [
    { name: "Daily Pass", price: "3,000", duration: "1 Day", features: ["Unlimited gym access", "All equipment access", "24h Validity"], popular: false },
    { name: "Bi-Weekly Pass", price: "10,000", duration: "14 Days", features: ["Unlimited gym access", "All equipment access", "Locker access", "Free PT Consult"], popular: true },
    { name: "Monthly Pass", price: "20,000", duration: "1 Month", features: ["Unlimited gym access", "Locker & Shower", "Free Wi-Fi access"], popular: false },
    { name: "Quarterly Pass", price: "55,000", duration: "3 Months", features: ["Unlimited gym access", "Free Guest Pass (1x)", "Locker access"], popular: false },
    { name: "Semi-Annual Pass", price: "110,000", duration: "6 Months", features: ["Unlimited gym access", "1 Month Pause option", "Discounted merch"], popular: false },
    { name: "Annual Pass", price: "220,000", duration: "1 Year", features: ["Unlimited gym access", "Priority PT booking", "Welcome Kit"], popular: false },
  ]

  const visiblePackages = showAll ? packages : packages.slice(0, 3)

  // Use dynamic gym branding
  const branding = getGymBranding(gymData)
  const accent = branding?.primaryColor || '#daa857'
  const dark = branding?.secondaryColor || '#000000'
  const heroTitle = branding?.heroTitle || 'Forge Your Legacy'
  const heroSubtitle = branding?.heroSubtitle || 'Luxury fitness meets raw performance. Elevate your standard.'
  const gymName = branding?.name || 'Klimarx Space'
  
  const logoUrl = branding?.logo
  const initials = branding?.initials || 'GP'
  const videoUrl = branding?.heroVideo || '/istockphoto-2013957555-640_adpp_is.mp4'
  const image1 = branding?.showcaseImage1 || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000'
  const image2 = branding?.showcaseImage2 || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000'

  // Fullscreen logic
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFull)
    }

    const events = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"]
    events.forEach(e => document.addEventListener(e, handleFullscreenChange))
    return () => events.forEach(e => document.removeEventListener(e, handleFullscreenChange))
  }, [])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    const elem = containerRef.current as any
    const doc = document as any

    if (!isFullscreen) {
      if (elem.requestFullscreen) await elem.requestFullscreen()
      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen()
      else if (elem.mozRequestFullScreen) await elem.mozRequestFullScreen()
      else if (elem.msRequestFullscreen) await elem.msRequestFullscreen()
    } else {
      if (doc.exitFullscreen) await doc.exitFullscreen()
      else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen()
      else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen()
      else if (doc.msExitFullscreen) await doc.msExitFullscreen()
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style jsx global>{`
        ::selection {
          background-color: ${accent}4d; /* 30% opacity */
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-card/50 backdrop-blur-lg transition-all duration-300">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border flex items-center justify-center font-bold text-xl" style={{ borderColor: `${accent}80`, backgroundColor: dark, color: accent }}>
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${gymName} Logo`}
                  fill
                  className="object-cover p-0"
                />
              ) : (
                initials
              )}
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">
              {gymName.split(' ')[0]}
              <span style={{ color: accent }}>{gymName.split(' ').slice(1).join(' ')}</span>
            </span>     
          </div>
          <div className="hidden md:flex items-center gap-4 md:gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-foreground transition-colors" style={{ color: accent }}>Experience</Link>
            <Link href="#membership" className="hover:text-foreground transition-colors" style={{ color: accent }}>Memberships</Link>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors font-bold"
              style={{ color: accent }}
            >
              Login
            </Link>
            <Link href="/signup">
              <Button
                className="px-8 rounded-none transition-transform hover:scale-105 font-bold"
                style={{ backgroundColor: accent, color: dark }}
              >
                Join the Elite
              </Button>
            </Link>
          </div>

          {/* Mobile Login Trigger */}
          <div className="flex md:hidden items-center gap-4">
            <Link
              href="/login"
              className="text-[10px] font-black tracking-[0.2em] border px-4 py-2 rounded-full backdrop-blur-sm bg-card/50"
              style={{ color: accent, borderColor: `${accent}4d` }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden bg-background">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-60"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0a]" />
        <div className="absolute inset-0 z-10 bg-card/50" />

        <div className="container relative z-20 mx-auto px-6 text-center">
          <h1 className="mb-6 text-6xl font-black uppercase italic tracking-tighter md:text-8xl lg:text-9xl animate-in slide-in-from-bottom-8 duration-700">
            {heroTitle.split(' ')[0]} <span style={{ color: accent }}>{heroTitle.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl font-light">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-10 text-lg font-black uppercase group" style={{ backgroundColor: accent, color: dark }}>
                Start Transformation <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#tour">
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold uppercase backdrop-blur-sm text-foreground hover:text-foreground border-border bg-transparent">
                <Play className="mr-2 h-5 w-5 fill-current text-foreground" /> Watch Tour
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Showcase Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-64 overflow-hidden rounded-2xl border" style={{ borderColor: `${accent}33` }}>
                <Image src={image1} alt="Gym" fill className="object-cover hover:scale-110 transition duration-700" />
              </div>
              <div className="relative h-64 mt-12 overflow-hidden rounded-2xl border" style={{ borderColor: `${accent}33` }}>
                <Image src={image2} alt="Training" fill className="object-cover hover:scale-110 transition duration-700" />
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-2xl md:text-4xl font-black uppercase md:text-5xl leading-tight italic">
                World-Class <span style={{ color: accent }}>Sanctuary</span> For Athletes
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Dumbbell />, title: "Prime Equipment", desc: "Custom-engineered machines and Olympic-grade free weights." },
                  { icon: <Users />, title: "Elite Coaching", desc: "Direct access to championship-winning personal trainers." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-accent transition-colors border border-transparent hover:border-border">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1a`, color: accent }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold italic uppercase">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section id="membership" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-2xl md:text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Choose Your <span style={{ color: accent }}>Tier</span>
            </h2>
          </div>

          <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visiblePackages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl p-4 md:p-8 transition-all duration-500 hover:-translate-y-2 ${
                  pkg.popular
                  ? 'bg-gradient-to-br scale-105 z-10 shadow-2xl'
                  : 'bg-card border border-border text-foreground'
                }`}
                style={pkg.popular ? { background: `linear-gradient(to bottom right, ${accent}, #b89778)`, color: dark } : {}}
              >
                {pkg.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-background text-[10px] font-black px-6 py-1 rounded-full" style={{ color: accent }}>Top Choice</span>}
                <h3 className={`text-2xl font-black uppercase italic ${pkg.popular ? '' : 'text-foreground'}`}>{pkg.name}</h3>
                <div className="my-8">
                  <span className="text-3xl md:text-5xl font-black italic">₦{pkg.price}</span>
                  <span className={`text-sm ml-2 font-bold ${pkg.popular ? 'opacity-70' : 'text-muted-foreground'}`}>/ {pkg.duration}</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold tracking-tight">
                      <CheckCircle className="h-5 w-5" style={{ color: pkg.popular ? dark : accent }} /> {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className={`w-full py-8 font-black uppercase tracking-widest rounded-xl ${pkg.popular ? 'bg-background text-foreground hover:bg-foreground hover:text-background' : 'text-black hover:opacity-90'}`} style={!pkg.popular ? { backgroundColor: accent, color: dark } : {}}>
                    Join Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-4 font-black group" style={{ color: accent }}>
              {showAll ? <><ChevronUp /> Show Less</> : <>View All Tiers <ChevronDown className="animate-bounce" /></>}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-[#050505] py-20 px-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 md:gap-10">
          <div className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">
            {gymName.split(' ')[0]}<span style={{ color: accent }}>{gymName.split(' ').slice(1).join(' ')}</span>
          </div>
          <div className="flex gap-12 font-bold text-xs text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer" style={{ ':hover': { color: accent } } as any}>Instagram</span>
            <span className="hover:text-foreground transition-colors cursor-pointer" style={{ ':hover': { color: accent } } as any}>Twitter</span>
            <span className="hover:text-foreground transition-colors cursor-pointer" style={{ ':hover': { color: accent } } as any}>Facebook</span>
          </div>
          <p className="text-xs text-muted-foreground font-bold italic">© 2026 {gymName.toUpperCase()}. ELITE ONLY.</p>
        </div>
      </footer>
    </main>
  )
}
