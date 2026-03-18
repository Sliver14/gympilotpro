'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, RefreshCw, AlertTriangle, Phone, Mail, CalendarX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ManualRenewalDialog from './manual-renewal-dialog'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface ExpiredMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  memberProfile: {
    expiryDate: string
    membership: {
      id: string
      name: string
      price: number
    }
  }
}

export default function ExpiredMembersList({ onMemberRenewed }: { onMemberRenewed?: () => void }) {
  const [members, setMembers] = useState<ExpiredMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<ExpiredMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchExpiredMembers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/expired-members')
      const data = await response.json()
      if (response.ok) {
        setMembers(data)
        setFilteredMembers(data)
      } else {
        throw new Error(data.error || 'Failed to fetch expired members')
      }
    } catch (error: any) {
      console.error('Error fetching expired members:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load expired members',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExpiredMembers()
  }, [toast])

  useEffect(() => {
    const filtered = members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phoneNumber.includes(searchTerm)
    )
    setFilteredMembers(filtered)
  }, [searchTerm, members])

  const getDaysExpired = (expiryDate: string) => {
    const days = Math.floor((Date.now() - new Date(expiryDate).getTime()) / (1000 * 60 * 60 * 24))
    return days
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
    <Card className="border-red-500/20 bg-red-500/5">
      <CardHeader>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-red-500">
              <CalendarX className="h-5 w-5 stroke-[3px]" /> Deactivated <span className="text-white">Members</span>
            </CardTitle>
            <CardDescription>Members with expired gym access requiring membership renewal</CardDescription>
          </div>
          <Button 
            onClick={fetchExpiredMembers} 
            variant="outline" 
            size="sm" 
            className="h-10 px-4 border-red-500/10 bg-black hover:bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Update Deactivated
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 transition-colors group-focus-within:text-red-500" />
          <Input
            placeholder="Search deactivated gym members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 pl-12 bg-black border-white/5 rounded-2xl focus:border-red-500 font-bold text-sm"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <div className="py-20 text-center bg-black/40 rounded-[2rem] border border-dashed border-white/5">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-800 mb-4 opacity-20" />
            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest italic">No expired members detected at the check-in.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-3xl bg-black border border-white/5 p-6 hover:border-red-500/30 transition-all group relative overflow-hidden">
                <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-red-500/5 blur-2xl group-hover:bg-red-500/10 transition-colors" />
                
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="font-black text-white uppercase italic tracking-tight text-lg mb-2">
                    {member.firstName} <span className="text-red-500">{member.lastName}</span>
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-600">
                      <Mail className="h-3 w-3 text-red-500/50" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-600">
                      <Phone className="h-3 w-3 text-red-500/50" />
                      {member.phoneNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-10 mt-6 md:mt-0 relative z-10">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black text-red-500 uppercase italic tracking-tight">
                      EXPIRED {getDaysExpired(member.memberProfile.expiryDate)} DAYS AGO
                    </p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                      LAST TIER: {member.memberProfile.membership.name.toUpperCase()}
                    </p>
                  </div>
                  
                  <ManualRenewalDialog 
                    memberId={member.id} 
                    memberName={`${member.firstName} ${member.lastName}`}
                    onRenewed={() => {
                        fetchExpiredMembers()
                        if (onMemberRenewed) onMemberRenewed()
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
