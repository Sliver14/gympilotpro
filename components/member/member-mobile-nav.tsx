'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useGym } from '@/components/gym-provider'
import { User, QrCode, Calendar, TrendingUp, Menu, Settings, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

interface MemberMobileNavProps {
  className?: string
}

function MemberMobileNavContent({ className }: MemberMobileNavProps) {
  const { gymData } = useGym()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'
  const [open, setOpen] = useState(false)

  const accent = gymData?.primaryColor || '#daa857'

  const allNavItems = [
    { title: 'Overview', tab: 'overview', icon: User },
    { title: 'Community', tab: 'community', icon: Trophy },
    { title: 'QR Code', tab: 'qr-code', icon: QrCode },
    { title: 'Attendance', tab: 'attendance', icon: Calendar },
    { title: 'Progress', tab: 'progress', icon: TrendingUp },
    { title: 'Profile', tab: 'profile', icon: Settings, isPath: true }, // We add profile as an extra
  ]

  // We have 4 items, we can either show 4 natively or show 3 and put the rest in Menu.
  // The prompt asks to reduce to max 4 tabs. 4 fits nicely.
  // Let's keep 3 and add 'Menu' for 'Progress' and 'Profile' to demonstrate the requested pattern.
  const primaryTabs = ['overview', 'qr-code', 'attendance']
  const primaryNavItems = allNavItems.filter(item => primaryTabs.includes(item.tab))
  const secondaryNavItems = allNavItems.filter(item => !primaryTabs.includes(item.tab))

  const handleTabClick = () => {
    setOpen(false)
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl md:hidden pb-safe',
        className
      )}
    >
      <div className="flex h-[72px] items-center justify-around px-2">
        {primaryNavItems.map((item) => {
          const isActive = currentTab === item.tab
          return (
            <Link
              key={item.tab}
              href={`/member/dashboard?tab=${item.tab}`}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-300 h-full"
            >
              <div
                className={cn(
                  'h-8 w-12 rounded-xl flex items-center justify-center transition-all duration-300',
                  isActive ? 'shadow-md' : 'text-muted-foreground'
                )}
                style={isActive ? { backgroundColor: accent, color: '#000', boxShadow: `0 4px 10px -2px ${accent}40` } : {}}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'stroke-[2.5px]' : 'stroke-[2px]')} />
              </div>
              <span
                className={cn(
                  'text-[9px] font-black',
                  isActive ? '' : 'text-muted-foreground'
                )}
                style={isActive ? { color: accent } : {}}
              >
                {item.title}
              </span>
            </Link>
          )
        })}

        {/* Menu Drawer */}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-300 h-full text-muted-foreground hover:text-foreground"
            >
              <div className="h-8 w-12 rounded-xl flex items-center justify-center transition-all duration-300">
                <Menu className="h-5 w-5 stroke-[2px]" />
              </div>
              <span className="text-[9px] font-black">
                Menu
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-background border-border">
            <DrawerHeader className="text-left pb-2">
              <DrawerTitle className="font-black uppercase tracking-widest text-lg">More Options</DrawerTitle>
            </DrawerHeader>
            <div className="grid grid-cols-2 gap-3 p-4 pt-0 pb-8">
              {secondaryNavItems.map((item) => {
                const isActive = item.isPath ? window.location.pathname.includes(item.tab) : currentTab === item.tab
                const href = item.isPath ? `/member/${item.tab}` : `/member/dashboard?tab=${item.tab}`
                return (
                  <Link
                    key={item.tab}
                    href={href}
                    onClick={handleTabClick}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                      isActive ? "bg-card border-transparent shadow-md" : "bg-card/50 border-border hover:bg-card hover:border-border/80"
                    )}
                    style={isActive ? { backgroundColor: `${accent}15`, borderColor: `${accent}40` } : {}}
                  >
                    <div className="p-3 rounded-full bg-background border border-border">
                       <item.icon className="h-6 w-6" style={isActive ? { color: accent } : {}} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black text-center",
                      isActive ? "" : "text-muted-foreground"
                    )}
                    style={isActive ? { color: accent } : {}}
                    >
                      {item.title}
                    </span>
                  </Link>
                )
              })}
            </div>
          </DrawerContent>
        </Drawer>

      </div>
    </nav>
  )
}

export function MemberMobileNav({ className }: MemberMobileNavProps) {
  return (
    <Suspense fallback={null}>
      <MemberMobileNavContent className={className} />
    </Suspense>
  )
}
