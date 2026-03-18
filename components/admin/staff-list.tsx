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
import { cn } from '@/lib/utils'

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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-[#daa857]" /> Staff <span className="text-[#daa857]">Members</span>
            </CardTitle>
            <CardDescription>{staff.length} authorized staff managing the gym</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <RegisterStaffDialog onStaffAdded={fetchStaff} />
            <Button 
              onClick={fetchStaff} 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 border-white/5 bg-black hover:bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              Update
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 transition-colors group-focus-within:text-[#daa857]" />
          <Input
            placeholder="Search personnel by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 pl-12 bg-black border-white/5 rounded-2xl focus:border-[#daa857] font-bold text-sm"
          />
        </div>

        {filteredStaff.length === 0 ? (
          <div className="py-20 text-center bg-black/20 rounded-[2rem] border border-dashed border-white/5">
            <UserCheck className="mx-auto h-12 w-12 text-gray-800 mb-4" />
            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest italic">No authorized personnel match the current query.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStaff.map((s) => {
              const initials = `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`.toUpperCase()

              return (
                <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-3xl bg-black/40 border border-white/5 p-6 hover:border-[#daa857]/30 transition-all group relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-white/5 blur-2xl group-hover:bg-[#daa857]/5 transition-colors" />
                  
                  <div className="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                    <Avatar className="h-14 w-14 border-2 border-white/5 group-hover:border-[#daa857]/30 transition-all duration-500 shadow-xl">
                      <AvatarImage src={s.profileImage || undefined} className="object-cover" />
                      <AvatarFallback className="bg-black text-[#daa857] font-black italic">
                        {initials || <User className="h-6 w-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-white uppercase italic tracking-tight text-lg leading-none mb-1">
                        {s.firstName} <span className="text-[#daa857]">{s.lastName}</span>
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span>{s.email}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-800" />
                        <span className="text-[#daa857]/50">{s.role.toUpperCase()} CORE</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-none border-white/5 relative z-10">
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">Specialization</p>
                      <p className="text-xs font-black text-white uppercase italic">{s.staffProfile?.specialization || 'General Role'}</p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">Personnel Since</p>
                      <p className="text-xs font-bold text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>

                    <Badge className="bg-[#daa857]/10 text-[#daa857] border border-[#daa857]/20 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic">
                      {s.role.toUpperCase()}
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
