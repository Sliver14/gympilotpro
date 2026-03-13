'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
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
import { User, QrCode, Calendar, TrendingUp, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MemberSidebarProps {
  memberData: any
  onLogout: () => void
}

function MemberSidebarContent({ memberData, onLogout }: MemberSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'
  const initials = `${memberData.firstName?.[0] ?? ''}${memberData.lastName?.[0] ?? ''}`.toUpperCase()
  const profileImage = memberData.profileImage || memberData.memberProfile?.profileImage

  const menuItems = [
    {
      title: 'Overview',
      url: '/member/dashboard?tab=overview',
      icon: User,
      active: currentTab === 'overview',
    },
    {
      title: 'QR Code',
      url: '/member/dashboard?tab=qr-code',
      icon: QrCode,
      active: currentTab === 'qr-code',
    },
    {
      title: 'Attendance',
      url: '/member/dashboard?tab=attendance',
      icon: Calendar,
      active: currentTab === 'attendance',
    },
    {
      title: 'Progress',
      url: '/member/dashboard?tab=progress',
      icon: TrendingUp,
      active: currentTab === 'progress',
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-transparent active:bg-transparent">
              <Link href="/member/dashboard">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-[#daa857]/30 transition-transform group-hover:scale-110">
                  <Image 
                    src="/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png" 
                    alt="Logo" 
                    width={28} 
                    height={24} 
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-black uppercase italic tracking-tighter text-lg">Klimarx<span className="text-[#daa857]">Space</span></span>
                  <span className="truncate text-[8px] font-bold uppercase tracking-[0.4em] text-gray-600 mt-0.5">Member Portal</span>
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
                        ? "bg-[#daa857]/10 text-[#daa857] font-black italic uppercase tracking-widest border-r-2 border-[#daa857]" 
                        : "text-gray-400 hover:text-[#daa857] font-bold uppercase tracking-widest hover:bg-white/5"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className={cn("size-4", item.active && "text-[#daa857]")} />
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
                  className="data-[state=open]:bg-[#daa857]/10 data-[state=open]:text-[#daa857] hover:bg-white/5 transition-all duration-300 h-14 rounded-xl border border-transparent hover:border-white/5"
                >
                  <Avatar className="size-8 rounded-lg border border-white/10">
                    <AvatarImage src={profileImage || undefined} className="object-cover" />
                    <AvatarFallback className="rounded-lg bg-[#daa857]/10 text-[#daa857] font-black">{initials || '??'}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-black uppercase italic tracking-tight">
                      {memberData.firstName} {memberData.lastName}
                    </span>
                    <span className="truncate text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{memberData.email}</span>
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
                    <p className="text-xs font-black uppercase italic tracking-widest">{memberData.firstName} {memberData.lastName}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{memberData.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl focus:bg-[#daa857]/10 focus:text-[#daa857] cursor-pointer py-3 px-4">
                  <Link href="/member/profile" className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                    <Settings className="size-4 text-[#daa857]" />
                    Profile Settings
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

export function MemberSidebar({ memberData, onLogout }: MemberSidebarProps) {
  return (
    <Suspense fallback={
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="h-16" />
        </SidebarHeader>
      </Sidebar>
    }>
      <MemberSidebarContent memberData={memberData} onLogout={onLogout} />
    </Suspense>
  )
}
