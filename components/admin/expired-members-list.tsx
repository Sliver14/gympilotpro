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
    <Card className="mt-6 border-destructive/20 bg-destructive/5">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <CalendarX className="h-5 w-5" />
              Expired Members
            </CardTitle>
            <CardDescription>Members whose subscriptions have ended and need renewal.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchExpiredMembers} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Search className="h-4 w-4 text-muted-foreground mt-2.5 ml-2 absolute" />
          <Input
            placeholder="Search expired members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No expired members found.</p>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border border-border bg-background p-3 gap-4">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium truncate text-base">
                    {member.firstName} {member.lastName}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {member.phoneNumber}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs">
                    <p className="font-semibold text-destructive">
                      Expired {getDaysExpired(member.memberProfile.expiryDate)} days ago
                    </p>
                    <p className="text-muted-foreground">
                      Last Plan: {member.memberProfile.membership.name}
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
