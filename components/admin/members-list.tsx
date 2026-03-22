'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Download, RefreshCw, User, Users, Search } from 'lucide-react'
import RegisterMemberDialog from './register-member-dialog'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useGym } from '@/components/gym-provider'
import { PLAN_LIMITS } from '@/lib/plans'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  profileImage: string | null
  memberProfile: {
    expiryDate: string
    membership: {
      name: string
    }
  }
}

export default function MembersList({ onMemberAdded }: { onMemberAdded?: () => void }) {
  const { gymData } = useGym()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const currentPlan = gymData?.subscriptions?.[0]?.plan || 'starter'
  const maxMembers = PLAN_LIMITS[currentPlan] || 200
  const isAtCapacity = maxMembers !== Infinity && members.length >= maxMembers

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/members')
      const data = await response.json()
      setMembers(data)
      setFilteredMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [toast])

  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMembers(filtered)
  }, [searchTerm, members])

  const handleExport = () => {
    const csv = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Membership', 'Expiry Date'],
      ...filteredMembers.map((m) => [
        m.firstName,
        m.lastName,
        m.email,
        m.phoneNumber,
        m.memberProfile.membership.name,
        new Date(m.memberProfile.expiryDate).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'members.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: 'Exported',
      description: 'Members list exported to CSV',
    })
  }

  const getMembershipStatus = (expiryDate: string) => {
    const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'expired'
    if (days <= 7) return 'expiring'
    return 'active'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#daa857]" /> Member <span className="text-[#daa857]">Directory</span>
            </CardTitle>
            <CardDescription>{members.length} verified members in the gym</CardDescription>
            {maxMembers !== Infinity && (
              <div className="mt-3 max-w-[200px]">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  <span>Capacity</span>
                  <span>{members.length} / {maxMembers}</span>
                </div>
                <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-500", isAtCapacity ? "bg-red-500" : "bg-[#daa857]")} 
                    style={{ width: `${Math.min((members.length / maxMembers) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAtCapacity ? (
              <Button 
                onClick={() => window.location.href = '/admin/billing'}
                className="bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                Upgrade Plan to Add More
              </Button>
            ) : (
              <RegisterMemberDialog onMemberAdded={() => {
                fetchMembers()
                if (onMemberAdded) onMemberAdded()
              }} />
            )}
            <Button 
              onClick={fetchMembers} 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 border-border bg-background hover:bg-accent text-muted-foreground font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              Update
            </Button>
            <Button 
              onClick={handleExport} 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 border-border bg-background hover:bg-accent text-muted-foreground font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl"
            >
              <Download className="h-3.5 w-3.5" />
              Extract
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#daa857]" />
          <Input
            placeholder="Filter members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 pl-12 bg-background border-border rounded-2xl focus:border-[#daa857] font-bold text-sm"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <div className="py-20 text-center bg-card/50 rounded-[2rem] border border-dashed border-border">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest italic">No matching members found in the database.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMembers.map((member) => {
              const status = getMembershipStatus(member.memberProfile.expiryDate)
              const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`.toUpperCase()

              return (
                <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-3xl bg-card/50 border border-border p-4 md:p-6 hover:border-[#daa857]/30 transition-all group relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 h-16 md:h-24 w-24 rounded-full bg-accent blur-2xl group-hover:bg-[#daa857]/5 transition-colors" />
                  
                  <div className="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                    <Avatar className="h-14 w-14 border-2 border-border group-hover:border-[#daa857]/30 transition-all duration-500 shadow-xl">
                      <AvatarImage src={member.profileImage || undefined} className="object-cover" />
                      <AvatarFallback className="bg-background text-[#daa857] font-black italic">
                        {initials || <User className="h-6 w-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-foreground uppercase italic tracking-tight text-lg leading-none mb-1">
                        {member.firstName} <span className="text-[#daa857]">{member.lastName}</span>
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <span className="truncate max-w-[150px]">{member.email}</span>
                        <span className="h-1 w-1 rounded-full bg-muted" />
                        <span className="text-[#daa857]/50">ID: {member.id.slice(-6).toUpperCase()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-none border-border relative z-10">
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Membership Plan</p>
                      <p className="text-xs font-black text-foreground uppercase italic">{member.memberProfile.membership.name}</p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Expiry Date</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                        {new Date(member.memberProfile.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>

                    <Badge
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-tighter border-none",
                        status === 'active' ? "bg-green-500 text-black" : status === 'expiring' ? "bg-[#daa857] text-black" : "bg-red-500 text-white"
                      )}
                    >
                      {status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
