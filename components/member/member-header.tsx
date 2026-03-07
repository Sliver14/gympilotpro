import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Settings } from 'lucide-react'

interface MemberHeaderProps {
  memberData: any
  onLogout: () => void
}

export default function MemberHeader({ memberData, onLogout }: MemberHeaderProps) {
  const initials = `${memberData.firstName[0]}${memberData.lastName[0]}`.toUpperCase()

  return (
    <header className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/member/dashboard" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[#daa857]/30 bg-white p-0.5 transition-transform group-hover:scale-110">
            <Image 
              src="/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png" 
              alt="Logo" 
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter">Klimarx<span className="text-[#daa857]">Space</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-[#daa857]/10 p-0">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={memberData.profileImage || memberData.memberProfile?.profileImage || undefined} className="object-cover" />
                  <AvatarFallback className="text-[10px] bg-[#daa857]/10 text-[#daa857] font-black">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#111] border-white/10 text-white rounded-xl">
              <DropdownMenuItem disabled className="opacity-100">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black uppercase italic">{memberData.firstName} {memberData.lastName}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{memberData.email}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-[#daa857]/10 focus:text-[#daa857] cursor-pointer">
                <Link href="/member/profile" className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                  <Settings className="h-3.5 w-3.5" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500/80 font-bold uppercase text-[10px] tracking-widest">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
