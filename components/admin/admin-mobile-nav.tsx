'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QrCode, TrendingUp, Users, Calendar, CreditCard, UserCheck, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminMobileNavProps {
  className?: string
}

function AdminMobileNavContent({ className }: AdminMobileNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const navItems = [
    { title: 'Overview', tab: 'overview', icon: TrendingUp },
    { title: 'Check-in', tab: 'check-in', icon: QrCode },
    { title: 'Members', tab: 'members', icon: Users },
    { title: 'Staff', tab: 'staff', icon: UserCheck },
    { title: 'Payments', tab: 'payments', icon: Wallet },
    { title: 'Attendance', tab: 'attendance', icon: Calendar },
    { title: 'Revenue', tab: 'revenue', icon: CreditCard },
  ]

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden',
        className
      )}
    >
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab
          return (
            <Link
              key={item.tab}
              href={`/admin/dashboard?tab=${item.tab}`}
              className="flex flex-1 flex-col items-center justify-center gap-1"
            >
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="icon"
                className={cn(
                  'h-10 w-10',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
              </Button>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
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

export function AdminMobileNav({ className }: AdminMobileNavProps) {
  return (
    <Suspense fallback={null}>
      <AdminMobileNavContent className={className} />
    </Suspense>
  )
}

