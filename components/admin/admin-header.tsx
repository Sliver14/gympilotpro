'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Settings } from 'lucide-react'
import { useGym } from '@/components/gym-provider'

interface AdminHeaderProps {
  adminData: any
  onLogout: () => void
  title?: string
  description?: string
}

export default function AdminHeader({ adminData, onLogout, title, description }: AdminHeaderProps) {
  const { gymSlug, gymData } = useGym()
  const initials = `${adminData.firstName?.[0] ?? ''}${adminData.lastName?.[0] ?? ''}`.toUpperCase()
  const profileImage = adminData.profileImage || adminData.memberProfile?.profileImage

  const accent = gymData?.primaryColor || '#daa857'
  const logo = gymData?.logo
  const gymName = gymData?.name || 'Klimarx'
  const gymInitials = gymName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/dashboard`} className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border flex items-center justify-center transition-transform group-hover:scale-110" style={{ borderColor: `${accent}4d`, backgroundColor: logo  ? 'white' : 'hsl(var(--card))' }}>
              {logo ? (
                <Image 
                  src={logo} 
                  alt="Logo" 
                  fill
                  className="object-contain p-0.5"
                />
              ) : (
                <span className="font-black italic text-xs" style={{ color: accent }}>{gymInitials}</span>
              )}
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter text-foreground">{gymName}<span style={{ color: accent }}>Space</span></span>
          </Link>
          
          {(title || description) && (
            <div className="hidden md:flex items-center gap-3 border-l border-border pl-4">
              {title && <h1 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>{title}</h1>}
              {description && <span className="h-1 w-1 rounded-full bg-muted" />}
              {description && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{description}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" style={{ hover: { backgroundColor: `${accent}1a` } } as any}>
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={profileImage || undefined} className="object-cover" />
                  <AvatarFallback className="text-[10px] font-black" style={{ backgroundColor: `${accent}1a`, color: accent }}>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border text-foreground rounded-xl">
              <DropdownMenuItem disabled className="opacity-100">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black uppercase italic">{adminData.firstName} {adminData.lastName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest capitalize">{adminData.role} DASHBOARD</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-accent cursor-pointer">
                <Link href="/admin/settings" className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                  <Settings className="h-3.5 w-3.5" style={{ color: accent }} />
                  Admin Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500/80 font-bold uppercase text-[10px] tracking-widest">
                <LogOut className="h-3.5 w-3.5" />
                System Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}