'use client'

import { SaaSSidebar } from './saas-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ShieldCheck } from 'lucide-react'

export function SaaSNavigation({ 
  user, 
  children 
}: { 
  user: { firstName: string, lastName: string, role: string, email?: string }, 
  children: React.ReactNode 
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-100 dark">
        <SaaSSidebar user={user} />
        <SidebarInset className="bg-zinc-900/50">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-6 sticky top-0 z-30 bg-zinc-950/50 backdrop-blur-md md:h-20">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500 md:hidden" />
                <h1 className="text-xs font-black tracking-[0.2em] text-zinc-500 uppercase">
                  Super <span className="text-orange-500">Admin</span> Dashboard
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
