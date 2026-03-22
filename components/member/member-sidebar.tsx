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
import { User, QrCode, Calendar, TrendingUp, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
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
  const { gymSlug, gymData } = useGym()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'
  const initials = `${memberData.firstName?.[0] ?? ''}${memberData.lastName?.[0] ?? ''}`.toUpperCase()
  const profileImage = memberData.profileImage || memberData.memberProfile?.profileImage

  const accent = gymData?.primaryColor || '#daa857'
  const logo = gymData?.logo
  const gymName = gymData?.name || 'Klimarx'
  const gymInitials = gymName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  const menuItems = [
    {
      title: 'Overview',
      url: `/member/dashboard?tab=overview`,
      icon: User,
      active: currentTab === 'overview',
    },
    {
      title: 'QR Code',
      url: `/member/dashboard?tab=qr-code`,
      icon: QrCode,
      active: currentTab === 'qr-code',
    },
    {
      title: 'Attendance',
      url: `/member/dashboard?tab=attendance`,
      icon: Calendar,
      active: currentTab === 'attendance',
    },
    {
      title: 'Progress',
      url: `/member/dashboard?tab=progress`,
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
              <Link href={`/member/dashboard`}>
                <div 
                  className={cn(
                    "flex aspect-square size-10 items-center justify-center rounded-xl p-1.5 shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] border transition-transform group-hover:scale-110 overflow-hidden",
                    logo ? "bg-white" : "bg-white dark:bg-card"
                  )} 
                  style={{ borderColor: `${accent}4d` }}
                >
                  {logo ? (
                    <Image 
                      src={logo} 
                      alt="Logo" 
                      width={28} 
                      height={24} 
                      className="object-contain"
                    />
                  ) : (
                    <span className="font-black italic text-lg" style={{ color: accent }}>{gymInitials}</span>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-black uppercase italic tracking-tighter text-lg">{gymName}<span style={{ color: accent }}>Space</span></span>
                  <span className="truncate text-[8px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-0.5">Member Portal</span>
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
                        ? "font-black italic uppercase tracking-widest border-r-2 bg-accent/50" 
                        : "text-muted-foreground font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground"
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
        <div className="px-4 py-2 border-t border-sidebar-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/50">Appearance</span>
            <ModeToggle />
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-accent hover:bg-accent transition-all duration-300 h-14 rounded-xl border border-transparent hover:border-border"
                >
                  <Avatar className="size-8 rounded-lg border border-border">
                    <AvatarImage src={profileImage || undefined} className="object-cover" />
                    <AvatarFallback className="rounded-lg font-black" style={{ backgroundColor: `${accent}1a`, color: accent }}>{initials || '??'}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-black uppercase italic tracking-tight text-foreground">
                      {memberData.firstName} {memberData.lastName}
                    </span>
                    <span className="truncate text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{memberData.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-popover border-border text-popover-foreground p-2 shadow-2xl"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem disabled className="opacity-100 p-4 border-b border-border mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-black uppercase italic tracking-widest text-foreground">{memberData.firstName} {memberData.lastName}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{memberData.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl focus:bg-accent cursor-pointer py-3 px-4 text-foreground focus:text-accent-foreground">
                  <Link href="/member/profile" className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                    <Settings className="size-4" style={{ color: accent }} />
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