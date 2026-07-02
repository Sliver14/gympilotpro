'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import DemoBookingModal from '@/components/demo-booking-modal'
import SupportClient from '@/components/support-client'

export default function SupportPage() {
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
            <Link href="/plans" className="hover:text-orange-500 transition-colors">Pricing</Link>
            <button onClick={openModal} className="hover:text-orange-500 transition-colors">Book Demo</button>
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
                <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Pricing</Link>
                <button onClick={openModal} className="text-left hover:text-orange-500 transition-colors">Book Demo</button>
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

      {/* Main Support Component */}
      <main className="pt-32 pb-20">
        <SupportClient />
      </main>

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
