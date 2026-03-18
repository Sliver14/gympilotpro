'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useGym } from '@/components/gym-provider'
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
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { QrCode, TrendingUp, Users, Calendar, CreditCard, LogOut, Settings, UserCheck, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminSidebarProps {
  adminData: any
  onLogout: () => void
}

function AdminSidebarContent({ adminData, onLogout }: AdminSidebarProps) {
  const pathname = usePathname()
  const { gymSlug, gymData } = useGym()
  const initials = `${adminData.firstName?.[0] ?? ''}${adminData.lastName?.[0] ?? ''}`.toUpperCase()
  const profileImage = adminData.profileImage || adminData.memberProfile?.profileImage

  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'
  const role = adminData.role || 'admin'

  const accent = gymData?.primaryColor || '#daa857'
  const logo = gymData?.logo || "/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png"
  const gymName = gymData?.name || 'Klimarx'

  const allMenuItems = [
    {
      title: 'Overview',
      url: `/${role}/dashboard?tab=overview`,
      icon: TrendingUp,
      active: currentTab === 'overview',
    },
    {
      title: 'Check-in',
      url: `/${role}/dashboard?tab=check-in`,
      icon: QrCode,
      active: currentTab === 'check-in',
    },
    {
      title: 'Members',
      url: `/${role}/dashboard?tab=members`,
      icon: Users,
      active: currentTab === 'members',
    },
    {
      title: 'Staff',
      url: `/${role}/dashboard?tab=staff`,
      icon: UserCheck,
      active: currentTab === 'staff',
      adminOnly: true,
    },
    {
      title: 'Payments',
      url: `/${role}/dashboard?tab=payments`,
      icon: Wallet,
      active: currentTab === 'payments',
    },
    {
      title: 'Attendance',
      url: `/${role}/dashboard?tab=attendance`,
      icon: Calendar,
      active: currentTab === 'attendance',
    },
    {
      title: 'Revenue',
      url: `/${role}/dashboard?tab=revenue`,
      icon: CreditCard,
      active: currentTab === 'revenue',
      adminOnly: true,
    },
  ]

  const menuItems = allMenuItems.filter(item => !item.adminOnly || role === 'admin')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-transparent active:bg-transparent">
              <Link href={`/${role}/dashboard`}>
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_0_20px_rgba(255,255,255,0.1)] border transition-transform group-hover:scale-110" style={{ borderColor: `${accent}4d` }}>
                  <Image 
                    src={logo} 
                    alt="Logo" 
                    width={28} 
                    height={24} 
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-black uppercase italic tracking-tighter text-lg">{gymName}<span style={{ color: accent }}>Space</span></span>
                  <span className="truncate text-[8px] font-bold uppercase tracking-[0.4em] text-gray-600 mt-0.5 capitalize">{role} Command</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-300 h-10 px-4",
                      item.active 
                        ? "font-black italic uppercase tracking-widest border-r-2" 
                        : "text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5"
                    )}
                    style={item.active ? { 
                      backgroundColor: `${accent}1a`, 
                      color: accent,
                      borderRightColor: accent
                    } : {}}
                  >
                    <Link href={item.url}>
                      <item.icon className={cn("size-4", item.active && "text-[#daa857]")} style={item.active ? { color: accent } : {}} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-white/5 hover:bg-white/5 transition-all duration-300 h-14 rounded-xl border border-transparent hover:border-white/5"
                >
                  <Avatar className="size-8 rounded-lg border border-white/10">
                    <AvatarImage src={profileImage || undefined} className="object-cover" />
                    <AvatarFallback className="rounded-lg font-black" style={{ backgroundColor: `${accent}1a`, color: accent }}>{initials || '??'}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-black uppercase italic tracking-tight">
                      {adminData.firstName} {adminData.lastName}
                    </span>
                    <span className="truncate text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{adminData.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-[#111] border-white/10 text-white p-2 shadow-2xl"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem disabled className="opacity-100 p-4 border-b border-white/5 mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-black uppercase italic tracking-widest">{adminData.firstName} {adminData.lastName}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{adminData.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl focus:bg-white/5 cursor-pointer py-3 px-4">
                  <Link href="/admin/settings" className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                    <Settings className="size-4" style={{ color: accent }} />
                    Protocol Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="rounded-xl focus:bg-red-500/10 focus:text-red-500 cursor-pointer py-3 px-4 mt-1 text-red-500/80">
                  <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                    <LogOut className="size-4" />
                    Log Out
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AdminSidebar({ adminData, onLogout }: AdminSidebarProps) {
  return (
    <Suspense fallback={
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="h-16" />
        </SidebarHeader>
      </Sidebar>
    }>
      <AdminSidebarContent adminData={adminData} onLogout={onLogout} />
    </Suspense>
  )
}
