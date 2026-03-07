'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Users, Search, RefreshCw, UserCheck, User } from 'lucide-react'
import RegisterStaffDialog from './register-staff-dialog'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  profileImage: string | null
  role: string
  createdAt: string
  staffProfile: {
    specialization: string | null
    joinDate: string
  } | null
}

export default function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchStaff = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/staff')
      const data = await response.json()
      if (response.ok) {
        setStaff(data)
        setFilteredStaff(data)
      } else {
        throw new Error(data.error || 'Failed to fetch staff')
      }
    } catch (error: any) {
      console.error('Error fetching staff:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load staff list',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [toast])

  useEffect(() => {
    const filtered = staff.filter(
      (s) =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredStaff(filtered)
  }, [searchTerm, staff])

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
              <UserCheck className="h-5 w-5" />
              Staff Members
            </CardTitle>
            <CardDescription>{staff.length} total staff members</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <RegisterStaffDialog onStaffAdded={fetchStaff} />
            <Button onClick={fetchStaff} variant="outline" size="sm" className="gap-2">
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
            placeholder="Search staff by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {filteredStaff.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No staff members found</p>
        ) : (
          <div className="space-y-2">
            {filteredStaff.map((s) => {
              const initials = `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`.toUpperCase()

              return (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={s.profileImage || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-xs">
                        {initials || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="font-medium capitalize">{s.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.staffProfile?.specialization || 'General Staff'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {s.role}
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
