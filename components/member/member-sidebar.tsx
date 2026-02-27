'use client'

import { Suspense } from 'react'
import Link from 'next/link'
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
import { Dumbbell, User, QrCode, Calendar, TrendingUp, LogOut, Settings } from 'lucide-react'
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
  const initials = `${memberData.firstName[0]}${memberData.lastName[0]}`.toUpperCase()

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
            <SidebarMenuButton asChild size="lg">
              <Link href="/member/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Dumbbell className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">KLIMARX</span>
                  <span className="truncate text-xs">Member Portal</span>
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
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
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
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={memberData.memberProfile?.profileImage || undefined} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {memberData.firstName} {memberData.lastName}
                    </span>
                    <span className="truncate text-xs">{memberData.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/member/profile" className="gap-2">
                    <Settings className="size-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="gap-2 text-destructive">
                  <LogOut className="size-4" />
                  Logout
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

