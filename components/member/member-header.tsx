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
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/member/dashboard" className="flex items-center gap-2">
          <Image 
            src="/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png" 
            alt="Klimarx Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
          <span className="text-xl font-bold">KLIMARX</span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={memberData.profileImage || memberData.memberProfile?.profileImage || undefined} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <span className="text-sm">
                  {memberData.firstName} {memberData.lastName}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/member/profile" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
