'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useGym } from '@/components/gym-provider'
import { Button } from '@/components/ui/button'
import { QrCode, TrendingUp, Users, Calendar, CreditCard, UserCheck, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminMobileNavProps {
  className?: string
  role?: string
}

function AdminMobileNavContent({ className, role = 'admin' }: AdminMobileNavProps) {
  const pathname = usePathname()
  const { gymSlug, gymData } = useGym()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const accent = gymData?.primaryColor || '#daa857'

  const allNavItems = [
    { title: 'Overview', tab: 'overview', icon: TrendingUp },
    { title: 'Check-in', tab: 'check-in', icon: QrCode },
    { title: 'Members', tab: 'members', icon: Users },
    { title: 'Staff', tab: 'staff', icon: UserCheck, adminOnly: true },
    { title: 'Payments', tab: 'payments', icon: Wallet },
    { title: 'Attendance', tab: 'attendance', icon: Calendar },
    { title: 'Revenue', tab: 'revenue', icon: CreditCard, adminOnly: true },
  ]

  const navItems = allNavItems.filter(item => !item.adminOnly || role === 'admin')

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/50 backdrop-blur-xl md:hidden pb-safe',
        className
      )}
    >
      <div className="flex h-20 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab
          return (
            <Link
              key={item.tab}
              href={`/${role}/dashboard?tab=${item.tab}`}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-300"
            >
              <div
                className={cn(
                  'h-10 w-14 rounded-xl flex items-center justify-center transition-all duration-300',
                  isActive ? 'shadow-lg' : 'text-muted-foreground'
                )}
                style={isActive ? { backgroundColor: accent, color: '#000', boxShadow: `0 10px 15px -3px ${accent}33` } : {}}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'stroke-[3px]' : 'stroke-[2px]')} />
              </div>
              <span
                className={cn(
                  'text-[8px] font-black uppercase tracking-[0.1em]',
                  isActive ? '' : 'text-muted-foreground'
                )}
                style={isActive ? { color: accent } : {}}
              >
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AdminMobileNav({ className, role }: AdminMobileNavProps) {
  return (
    <Suspense fallback={null}>
      <AdminMobileNavContent className={className} role={role} />
    </Suspense>
  )
}

