'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShieldCheck
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/saas-admin/dashboard' },
  { name: 'Gyms', icon: Building2, href: '/saas-admin/gyms' },
  { name: 'Subscribers', icon: Users, href: '/saas-admin/subscribers' },
  { name: 'Payments', icon: CreditCard, href: '/saas-admin/payments' },
  { name: 'Settings', icon: Settings, href: '/saas-admin/settings' },
]

interface SaaSSidebarProps {
  user: { firstName: string, lastName: string, role: string, email?: string }
}

export function SaaSSidebar({ user }: SaaSSidebarProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-800 bg-zinc-950">
      <SidebarHeader className="border-b border-zinc-800 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-transparent active:bg-transparent">
              <Link href="/saas-admin/dashboard">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-orange-500/10 p-1.5 border border-orange-500/20">
                  <ShieldCheck className="w-6 h-6 text-orange-500" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-black uppercase tracking-tighter text-lg text-zinc-100">GymPilot<span className="text-orange-500">Pro</span></span>
                  <span className="truncate text-[8px] font-bold tracking-[0.4em] text-zinc-500 mt-0.5 uppercase">Super Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "transition-all duration-300 h-10 px-4",
                        isActive 
                          ? "font-black bg-orange-500/10 text-orange-500 border-r-2 border-orange-500" 
                          : "text-zinc-400 font-bold hover:bg-zinc-800/50 hover:text-zinc-100"
                      )}
                    >
                      <Link href={item.href} onClick={() => setOpenMobile(false)}>
                        <item.icon className={cn("size-4", isActive ? "text-orange-500" : "text-zinc-500")} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800 bg-zinc-950 p-2">
        <div className="px-4 py-2 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Theme</span>
          <ModeToggle />
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-zinc-800/50 hover:bg-zinc-800/50 transition-all duration-300 h-14 rounded-xl"
                >
                  <Avatar className="size-8 rounded-lg border border-zinc-800">
                    <AvatarFallback className="rounded-lg font-black bg-orange-500/10 text-orange-500">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-black text-zinc-100">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="truncate text-[10px] font-bold text-zinc-500 capitalize">{user.role.replace('_', ' ')}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-zinc-950 border-zinc-800 text-zinc-100 p-2 shadow-2xl"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem disabled className="opacity-100 p-4 border-b border-zinc-800 mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-black text-zinc-100">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] font-bold text-zinc-500 capitalize">{user.role}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl focus:bg-zinc-800 cursor-pointer py-3 px-4">
                  <Link href="/api/auth/logout" className="flex items-center gap-3 font-black text-[10px] text-red-500">
                    <LogOut className="size-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
