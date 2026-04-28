'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Menu 
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/saas-admin/dashboard' },
  { name: 'Gyms', icon: Building2, href: '/saas-admin/gyms' },
  { name: 'Subscribers', icon: Users, href: '/saas-admin/subscribers' },
  { name: 'Payments', icon: CreditCard, href: '/saas-admin/payments' },
  { name: 'Settings', icon: Settings, href: '/saas-admin/settings' },
]

export function SaaSNavigation({ 
  user, 
  children 
}: { 
  user: { firstName: string, lastName: string, role: string }, 
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const UserFooter = () => (
    <div className="p-4 border-t border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400">
        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold shrink-0">
          {user.firstName[0]}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium text-zinc-100">{user.firstName} {user.lastName}</p>
          <p className="truncate text-xs text-zinc-500 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
      </div>
      <Link
        href="/api/auth/logout"
        className="flex items-center gap-3 px-3 py-2 mt-2 text-sm font-medium text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </Link>
    </div>
  )

  const NavLinks = () => (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {menuItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive 
                ? 'bg-orange-500/10 text-orange-500' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-zinc-500'}`} />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden dark">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-zinc-950 border-r border-zinc-800 flex-col h-full z-10 shadow-sm">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-orange-500" />
          <span className="font-bold text-xl text-zinc-100 tracking-tight">GymPilotPro</span>
        </div>
        <NavLinks />
        <UserFooter />
      </aside>

      {/* Mobile Top Nav & Drawer */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-zinc-950 border-b border-zinc-800 flex items-center justify-between p-4 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-lg text-zinc-100">GymPilotPro</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-zinc-950 border-r border-zinc-800 text-zinc-100 dark">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-orange-500" />
                <span className="font-bold text-xl text-zinc-100">GymPilotPro</span>
              </div>
              <NavLinks />
              <UserFooter />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
