'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Users, Search, Download, RefreshCw } from 'lucide-react'
import RegisterMemberDialog from './register-member-dialog'
import { Spinner } from '@/components/ui/spinner'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  memberProfile: {
    expiryDate: string
    membership: {
      name: string
    }
  }
}

export default function MembersList() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members
            </CardTitle>
            <CardDescription>{members.length} total members</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RegisterMemberDialog onMemberAdded={fetchMembers} />
            <Button onClick={fetchMembers} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No members found</p>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const status = getMembershipStatus(member.memberProfile.expiryDate)
              return (
                <div key={member.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="font-medium">{member.memberProfile.membership.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(member.memberProfile.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        status === 'active' ? 'default' : status === 'expiring' ? 'secondary' : 'destructive'
                      }
                    >
                      {status === 'active' && 'Active'}
                      {status === 'expiring' && 'Expiring'}
                      {status === 'expired' && 'Expired'}
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
