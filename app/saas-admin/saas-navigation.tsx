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
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
          {user.firstName[0]}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="truncate text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
      </div>
      <Link
        href="/api/auth/logout"
        className="flex items-center gap-3 px-3 py-2 mt-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
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
                ? 'bg-orange-50 text-orange-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col h-full z-10 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-orange-600" />
          <span className="font-bold text-xl text-gray-900 tracking-tight">GymPilotPro</span>
        </div>
        <NavLinks />
        <UserFooter />
      </aside>

      {/* Mobile Top Nav & Drawer */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between p-4 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-orange-600" />
            <span className="font-bold text-lg text-gray-900">GymPilotPro</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-orange-600" />
                <span className="font-bold text-xl text-gray-900">GymPilotPro</span>
              </div>
              <NavLinks />
              <UserFooter />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
