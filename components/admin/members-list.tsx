'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Download, RefreshCw, User, Users, Search, Filter, Calendar, Phone, Mail, Activity, AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react'
import RegisterMemberDialog from './register-member-dialog'
import ManualRenewalDialog from './manual-renewal-dialog'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
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
  createdAt: string
  _count?: {
    payments: number
  }
  memberProfile: {
    id: string
    membershipId: string
    joinDate: string
    expiryDate: string
    gender: string | null
    birthday: string | null
    hearAboutUs: string | null
    fitnessGoals: string | null // Might be JSON string depending on db, but treated as string here
    fitnessGoalsDetails: string | null
    paymentMethod: string | null
    emergencyContact: string | null
    emergencyPhone: string | null
    verified: boolean
    paymentStatus: string
    membership: {
      name: string
      price: number
      duration: number
    }
  }
}

export default function MembersList({ onMemberAdded }: { onMemberAdded?: () => void }) {
  const { gymData } = useGym()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
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

  const getMembershipStatus = (expiryDate: string) => {
    const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'expired'
    if (days <= 7) return 'expiring'
    return 'active'
  }

  useEffect(() => {
    let filtered = members

    // Name/Email search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((member) => getMembershipStatus(member.memberProfile.expiryDate) === statusFilter)
    }

    // Date filter (Join Date)
    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter((member) => {
        const joinDate = new Date(member.createdAt)
        const diffTime = Math.abs(now.getTime() - joinDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (dateFilter === 'today') return diffDays <= 1
        if (dateFilter === '7days') return diffDays <= 7
        if (dateFilter === '30days') return diffDays <= 30
        return true
      })
    }

    setFilteredMembers(filtered)
  }, [searchTerm, statusFilter, dateFilter, members])

  const handleExport = () => {
    const csv = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Membership', 'Join Date', 'Expiry Date', 'Member Type'],
      ...filteredMembers.map((m) => {
        const paymentCount = m._count?.payments || 0;
        const memberType = paymentCount <= 1 ? 'New Member' : 'Renewal';
        return [
          m.firstName,
          m.lastName,
          m.email,
          m.phoneNumber,
          m.memberProfile.membership.name,
          new Date(m.createdAt).toLocaleDateString(),
          new Date(m.memberProfile.expiryDate).toLocaleDateString(),
          memberType
        ]
      }),
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

  const openMemberDetails = (member: Member) => {
    setSelectedMember(member)
    setIsSheetOpen(true)
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
    <>
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
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
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
                  className="bg-orange-500 hover:bg-orange-600 text-black font-black rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)]"
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
                className="h-10 px-4 border-border bg-background hover:bg-accent text-muted-foreground font-black text-[10px] gap-2 rounded-xl"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                Update
              </Button>
              <Button 
                onClick={handleExport} 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 border-border bg-background hover:bg-accent text-muted-foreground font-black text-[10px] gap-2 rounded-xl"
              >
                <Download className="h-3.5 w-3.5" />
                Extract
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#daa857]" />
              <Input
                placeholder="Filter members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pl-12 bg-background border-border rounded-2xl focus:border-[#daa857] font-bold text-sm w-full"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-14 w-full md:w-[160px] bg-background border-border rounded-2xl font-bold text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="all" className="font-bold text-xs">All Statuses</SelectItem>
                  <SelectItem value="active" className="font-bold text-xs">Active</SelectItem>
                  <SelectItem value="expiring" className="font-bold text-xs">Expiring Soon</SelectItem>
                  <SelectItem value="expired" className="font-bold text-xs">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-14 w-full md:w-[160px] bg-background border-border rounded-2xl font-bold text-xs">
                  <SelectValue placeholder="Join Date" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="all" className="font-bold text-xs">All Time</SelectItem>
                  <SelectItem value="today" className="font-bold text-xs">Joined Today</SelectItem>
                  <SelectItem value="7days" className="font-bold text-xs">Last 7 Days</SelectItem>
                  <SelectItem value="30days" className="font-bold text-xs">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="py-20 text-center bg-card/50 rounded-[2rem] border border-dashed border-border">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-bold text-muted-foreground">No matching members found in the database.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredMembers.map((member) => {
                const status = getMembershipStatus(member.memberProfile.expiryDate)
                const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`.toUpperCase()
                const paymentCount = member._count?.payments || 0
                const isNewMember = paymentCount <= 1

                return (
                  <div 
                    key={member.id} 
                    onClick={() => openMemberDetails(member)}
                    className="flex flex-col md:flex-row md:items-center justify-between rounded-3xl bg-card/50 border border-border p-4 md:p-6 hover:border-[#daa857]/30 transition-all group relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute -right-12 -top-12 h-16 md:h-24 w-24 rounded-full bg-accent blur-2xl group-hover:bg-[#daa857]/5 transition-colors" />
                    
                    <div className="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                      <Avatar className="h-14 w-14 border-2 border-border group-hover:border-[#daa857]/30 transition-all duration-500 shadow-xl">
                        <AvatarImage src={member.profileImage || undefined} className="object-cover" />
                        <AvatarFallback className="bg-background text-[#daa857] font-black">
                          {initials || <User className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-black text-foreground uppercase tracking-tight text-lg leading-none mb-1 flex items-center gap-2">
                          {member.firstName} <span className="text-[#daa857]">{member.lastName}</span>
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-2 mt-1.5">
                          <span className="truncate max-w-[150px]">{member.email}</span>
                          <span className="h-1 w-1 rounded-full bg-muted" />
                          <span className="text-[#daa857]/50">ID: {member.id.slice(-6).toUpperCase()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-none border-border relative z-10">
                      <div className="text-left md:text-right hidden sm:block">
                        <p className="text-[8px] font-black text-muted-foreground mb-1">Plan</p>
                        <p className="text-xs font-black text-foreground">{member.memberProfile.membership.name}</p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-[8px] font-black text-muted-foreground mb-1">Expiry</p>
                        <p className="text-xs font-bold text-muted-foreground">
                          {new Date(member.memberProfile.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <Badge
                          className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black border-none uppercase w-fit",
                            isNewMember ? "bg-blue-500/20 text-blue-500" : "bg-purple-500/20 text-purple-500"
                          )}
                        >
                          {isNewMember ? "New Member" : "Renewal"}
                        </Badge>
                        <Badge
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black border-none",
                            status === 'active' ? "bg-green-500 text-black" : status === 'expiring' ? "bg-[#daa857] text-black" : "bg-red-500 text-white"
                          )}
                        >
                          {status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Details Sidebar (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l border-border bg-card p-0 flex flex-col h-full rounded-l-[2.5rem] overflow-hidden [&>button:last-child]:left-4 [&>button:last-child]:right-auto">
          {selectedMember && (() => {
            const status = getMembershipStatus(selectedMember.memberProfile.expiryDate)
            const initials = `${selectedMember.firstName?.[0] ?? ''}${selectedMember.lastName?.[0] ?? ''}`.toUpperCase()
            const paymentCount = selectedMember._count?.payments || 0
            const isNewMember = paymentCount <= 1

            return (
              <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                {/* Header Profile Section */}
                <div className="p-6 md:p-8 bg-background/50 border-b border-border relative">
                  <div className="absolute right-6 top-6 flex flex-col gap-2 items-end">
                    <Badge
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black border-none uppercase shadow-sm",
                        status === 'active' ? "bg-green-500 text-black" : status === 'expiring' ? "bg-[#daa857] text-black" : "bg-red-500 text-white"
                      )}
                    >
                      {status.toUpperCase()}
                    </Badge>
                    <Badge
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black border-none uppercase shadow-sm",
                        isNewMember ? "bg-blue-500/20 text-blue-500" : "bg-purple-500/20 text-purple-500"
                      )}
                    >
                      {isNewMember ? "New Member" : "Renewal"}
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center mt-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-2xl mb-4 relative z-10">
                      <AvatarImage src={selectedMember.profileImage || undefined} className="object-cover" />
                      <AvatarFallback className="bg-accent text-[#daa857] font-black text-2xl">
                        {initials || <User className="h-10 w-10" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <SheetTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-center">
                      {selectedMember.firstName} <span className="text-[#daa857]">{selectedMember.lastName}</span>
                    </SheetTitle>
                    <SheetDescription className="text-center font-bold text-xs mt-1">
                      Member ID: {selectedMember.id.slice(-8).toUpperCase()}
                    </SheetDescription>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-8 flex-1">
                  
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2 uppercase">
                      <User className="h-4 w-4 text-[#daa857]" /> Personal Info
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background/30 rounded-2xl p-4 border border-border">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Email</p>
                          <p className="text-xs font-bold truncate max-w-[140px]" title={selectedMember.email}>{selectedMember.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Phone</p>
                          <p className="text-xs font-bold">{selectedMember.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Birthday</p>
                          <p className="text-xs font-bold">{selectedMember.memberProfile.birthday || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Gender</p>
                          <p className="text-xs font-bold capitalize">{selectedMember.memberProfile.gender || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Membership & Payment Status */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2 uppercase">
                        <CreditCard className="h-4 w-4 text-[#daa857]" /> Membership Details
                      </h3>
                      {status !== 'active' && (
                        <ManualRenewalDialog 
                          memberId={selectedMember.id} 
                          memberName={`${selectedMember.firstName} ${selectedMember.lastName}`}
                          onRenewed={() => {
                            fetchMembers()
                            setIsSheetOpen(false)
                          }} 
                        />
                      )}
                    </div>
                    <div className="bg-background/30 rounded-2xl p-4 border border-border space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Current Plan</p>
                          <p className="text-sm font-black uppercase">{selectedMember.memberProfile.membership.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Price</p>
                          <p className="text-sm font-black">₦{selectedMember.memberProfile.membership.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Join Date</p>
                          <p className="text-xs font-bold">
                            {new Date(selectedMember.memberProfile.joinDate || selectedMember.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Expiry Date</p>
                          <p className="text-xs font-bold text-red-400">
                            {new Date(selectedMember.memberProfile.expiryDate).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-2">
                         {selectedMember.memberProfile.paymentStatus === 'approved' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                         ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                         )}
                         <p className="text-[10px] font-bold text-muted-foreground uppercase">
                           Payment Method: <span className="text-foreground">{selectedMember.memberProfile.paymentMethod || 'N/A'}</span>
                         </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2 uppercase">
                      <AlertCircle className="h-4 w-4 text-[#daa857]" /> Emergency Contact
                    </h3>
                    <div className="bg-background/30 rounded-2xl p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                       <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Name</p>
                          <p className="text-xs font-bold">{selectedMember.memberProfile.emergencyContact || 'Not Provided'}</p>
                       </div>
                       <div className="sm:text-right">
                          <p className="text-[9px] text-muted-foreground font-black uppercase">Phone</p>
                          <p className="text-xs font-bold">{selectedMember.memberProfile.emergencyPhone || 'Not Provided'}</p>
                       </div>
                    </div>
                  </div>

                  {/* Fitness Goals */}
                  {(selectedMember.memberProfile.fitnessGoals || selectedMember.memberProfile.fitnessGoalsDetails) && (
                    <>
                      <Separator className="bg-border/50" />
                      <div className="space-y-4 mb-8">
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2 uppercase">
                          <Activity className="h-4 w-4 text-[#daa857]" /> Health & Goals
                        </h3>
                        <div className="bg-background/30 rounded-2xl p-4 border border-border">
                           {selectedMember.memberProfile.fitnessGoals && (
                             <div className="mb-3">
                               <p className="text-[9px] text-muted-foreground font-black uppercase mb-1">Goals</p>
                               <div className="flex flex-wrap gap-2">
                                  {(() => {
                                    try {
                                      // If it's stored as JSON string array
                                      const goals = JSON.parse(selectedMember.memberProfile.fitnessGoals);
                                      if (Array.isArray(goals)) {
                                        return goals.map((goal, i) => (
                                          <Badge key={i} variant="secondary" className="text-[10px] uppercase font-bold bg-accent/50">{goal}</Badge>
                                        ))
                                      }
                                      return <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-accent/50">{selectedMember.memberProfile.fitnessGoals}</Badge>
                                    } catch {
                                      return <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-accent/50">{selectedMember.memberProfile.fitnessGoals}</Badge>
                                    }
                                  })()}
                               </div>
                             </div>
                           )}
                           
                           {selectedMember.memberProfile.fitnessGoalsDetails && (
                             <div>
                               <p className="text-[9px] text-muted-foreground font-black uppercase mb-1">Details & Conditions</p>
                               <p className="text-xs font-medium text-foreground leading-relaxed">
                                 {selectedMember.memberProfile.fitnessGoalsDetails}
                               </p>
                             </div>
                           )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })()}
        </SheetContent>
      </Sheet>
    </>
  )
}