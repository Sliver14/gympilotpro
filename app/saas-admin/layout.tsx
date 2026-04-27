import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { LayoutDashboard, Building2, Users, CreditCard, Settings, LogOut, ShieldCheck } from 'lucide-react'

export default async function SaaSAdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'superadmin') {
    redirect('/saas-login')
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/saas-admin/dashboard' },
    { name: 'Gyms', icon: Building2, href: '/saas-admin/gyms' },
    { name: 'Subscribers', icon: Users, href: '/saas-admin/subscribers' },
    { name: 'Payments', icon: CreditCard, href: '/saas-admin/payments' },
    { name: 'Settings', icon: Settings, href: '/saas-admin/settings' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-orange-600" />
          <span className="font-bold text-lg text-gray-900">GymPilotPro</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              {user.firstName[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-gray-500">Super Admin</p>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
