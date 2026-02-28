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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dumbbell, QrCode, TrendingUp, Users, Calendar, CreditCard, LogOut, Settings, UserCheck, Wallet } from 'lucide-react'
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
  const initials = `${adminData.firstName?.[0] ?? ''}${adminData.lastName?.[0] ?? ''}`.toUpperCase()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const menuItems = [
    {
      title: 'Overview',
      url: '/admin/dashboard?tab=overview',
      icon: TrendingUp,
      active: currentTab === 'overview',
    },
    {
      title: 'Check-in',
      url: '/admin/dashboard?tab=check-in',
      icon: QrCode,
      active: currentTab === 'check-in',
    },
    {
      title: 'Members',
      url: '/admin/dashboard?tab=members',
      icon: Users,
      active: currentTab === 'members',
    },
    {
      title: 'Staff',
      url: '/admin/dashboard?tab=staff',
      icon: UserCheck,
      active: currentTab === 'staff',
    },
    {
      title: 'Payments',
      url: '/admin/dashboard?tab=payments',
      icon: Wallet,
      active: currentTab === 'payments',
    },
    {
      title: 'Attendance',
      url: '/admin/dashboard?tab=attendance',
      icon: Calendar,
      active: currentTab === 'attendance',
    },
    {
      title: 'Revenue',
      url: '/admin/dashboard?tab=revenue',
      icon: CreditCard,
      active: currentTab === 'revenue',
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Dumbbell className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">KLIMARX</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
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
                    <AvatarFallback className="rounded-lg">{initials || '??'}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {adminData.firstName} {adminData.lastName}
                    </span>
                    <span className="truncate text-xs">{adminData.email}</span>
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
                  <Link href="/admin/settings" className="gap-2">
                    <Settings className="size-4" />
                    Settings
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

