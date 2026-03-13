'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
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

export default function Home() {
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
    { name: "Annual Pass", price: "220,000", duration: "1 Year", features: ["Unlimited gym access", "Priority PT booking", "Klimarx Welcome Kit"], popular: false },
  ]

  const visiblePackages = showAll ? packages : packages.slice(0, 3)

  const accent = '#daa857'
  const dark = '#000000'

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

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#daa857]/30 overflow-x-hidden">
      
      {/* Navigation - Glassmorphic / semi-transparent over video */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/30 backdrop-blur-lg transition-all duration-300">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border" style={{ borderColor: `${accent}80` }}>
              <Image 
                src="/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png" 
                alt="Klimarx Space Logo" 
                fill
                className="object-contain p-1 bg-white"
              />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Klimarx<span style={{ color: accent }}>Space</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
            <Link href="#features" className="hover:text-[#daa857] transition-colors">Experience</Link>
            <Link href="#membership" className="hover:text-[#daa857] transition-colors">Memberships</Link>
            <Link 
              href="/login"
              className="hover:text-[#daa857] transition-colors uppercase font-bold tracking-widest"
            >
              Login
            </Link>
            <Link href="/signup">
              <Button 
                className="px-8 rounded-none transition-transform hover:scale-105 text-black font-bold bg-[#daa857] hover:bg-[#cdb48b]"
                >                Join the Elite
              </Button>
            </Link>
          </div>

          {/* Mobile Login Trigger */}
          <div className="flex md:hidden items-center gap-4">
            <Link 
              href="/login"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[#daa857] border border-[#daa857]/30 px-4 py-2 rounded-full backdrop-blur-sm bg-black/20"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden bg-black">
        {/* Slow Motion Cinematic Background */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-60"
        >
          <source 
            src="/istockphoto-2013957555-640_adpp_is.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0a]" />
        <div className="absolute inset-0 z-10 bg-black/20" />

        <div className="container relative z-20 mx-auto px-6 text-center">
          <h1 className="mb-6 text-6xl font-black uppercase italic tracking-tighter md:text-8xl lg:text-9xl animate-in slide-in-from-bottom-8 duration-700">
            Forge Your <span style={{ color: accent }}>Legacy</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl font-light">
            Luxury fitness meets raw performance. Elevate your standard at 
            <span className="text-white font-bold"> Klimarx Space</span>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-10 text-lg font-black uppercase text-black group bg-[#daa857] hover:bg-[#cdb48b]">
                Start Transformation <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#tour">
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold uppercase backdrop-blur-sm text-white hover:text-white" style={{ borderColor: 'white' }}>
                <Play className="mr-2 h-5 w-5 fill-current text-white" /> Watch Tour
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Showcase Section */}
      <section id="features" className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-64 overflow-hidden rounded-2xl border" style={{ borderColor: `${accent}33` }}>
                <Image src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000" alt="Gym" fill className="object-cover hover:scale-110 transition duration-700" />
              </div>
              <div className="relative h-64 mt-12 overflow-hidden rounded-2xl border" style={{ borderColor: `${accent}33` }}>
                <Image src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000" alt="Training" fill className="object-cover hover:scale-110 transition duration-700" />
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-black uppercase md:text-5xl leading-tight italic">
                World-Class <span style={{ color: accent }}>Sanctuary</span> For Athletes
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Dumbbell />, title: "Prime Equipment", desc: "Custom-engineered machines and Olympic-grade free weights." },
                  { icon: <Users />, title: "Elite Coaching", desc: "Direct access to championship-winning personal trainers." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-black" style={{ backgroundColor: `${accent}1a` }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold italic uppercase">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="tour" className="py-12 md:py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div 
            ref={containerRef}
            className="group relative aspect-video w-full max-w-5xl mx-auto overflow-hidden rounded-2xl md:rounded-[2.5rem] border transition-all duration-700 shadow-2xl bg-black" 
            style={{ borderColor: `${accent}4d`, boxShadow: `0 0 50px ${accent}0d` }}
          >
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              loop 
              playsInline
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
            >
              <source src="/istockphoto-1480810276-640_adpp_is.mp4" type="video/mp4" />
            </video>
            
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity group-hover:opacity-10" />

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/70 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Maximize2 className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section id="membership" className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Choose Your <span style={{ color: accent }}>Tier</span>
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visiblePackages.map((pkg, idx) => (
              <div 
                key={idx}
                className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                  pkg.popular 
                  ? 'bg-gradient-to-br text-black scale-105 z-10 shadow-2xl' 
                  : 'bg-[#111] border border-white/10'
                }`}
                style={pkg.popular ? { background: `linear-gradient(to bottom right, ${accent}, #b89778)` } : {}}
              >
                {pkg.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-[#daa857] text-[10px] font-black px-6 py-1 rounded-full uppercase">Top Choice</span>}
                <h3 className={`text-2xl font-black uppercase italic ${pkg.popular ? 'text-black' : 'text-white'}`}>{pkg.name}</h3>
                <div className="my-8">
                  <span className="text-5xl font-black italic">₦{pkg.price}</span>
                  <span className={`text-sm ml-2 font-bold ${pkg.popular ? 'text-black/60' : 'text-gray-500'}`}>/ {pkg.duration}</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold tracking-tight">
                      <CheckCircle className="h-5 w-5" style={{ color: pkg.popular ? dark : accent }} /> {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className={`w-full py-8 font-black uppercase tracking-widest rounded-xl ${pkg.popular ? 'bg-black text-white hover:bg-zinc-900' : 'text-black'}`} style={!pkg.popular ? { backgroundColor: accent } : {}}>
                    Join Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-4 font-black uppercase tracking-widest group" style={{ color: accent }}>
              {showAll ? <><ChevronUp /> Show Less</> : <>View All Tiers <ChevronDown className="animate-bounce" /></>}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black flex justify-center">
        <div className="container px-6">
          <div className="rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group" style={{ backgroundColor: accent, color: dark }}>
            <Dumbbell className="absolute -top-10 -left-10 h-64 w-64 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-8">No More <span className="text-white">Excuses</span></h2>
            <Link href="/signup">
              <Button size="lg" className="h-20 px-16 text-2xl font-black uppercase rounded-full transition-all bg-black text-[#daa857] hover:bg-black/80">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-[#050505] py-20 px-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-4xl font-black uppercase italic tracking-tighter">Klimarx<span style={{ color: accent }}>Space</span></div>
          <div className="flex gap-12 font-bold uppercase text-xs tracking-widest text-gray-500">
            <span className="hover:text-[#daa857] transition-colors cursor-pointer">Instagram</span>
            <span className="hover:text-[#daa857] transition-colors cursor-pointer">Twitter</span>
            <span className="hover:text-[#daa857] transition-colors cursor-pointer">Facebook</span>
          </div>
          <p className="text-xs text-gray-600 font-bold tracking-widest uppercase italic">© 2026 KLIMARX SPACE. ELITE ONLY.</p>
        </div>
      </footer>
    </main>
  )
}