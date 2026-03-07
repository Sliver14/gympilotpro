'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Loader2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface Membership {
  id: string
  name: string
  price: number
  duration: number
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS / Card']

export default function RegisterMemberDialog({ onMemberAdded }: { onMemberAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthday: '',
    gender: '',
    membershipId: '',
    paymentMethod: '',
    fitnessGoals: [] as string[],
    fitnessGoalsDetails: '',
    startDate: new Date().toISOString().split('T')[0],
    paymentCompleted: true,
  })

  useEffect(() => {
    if (open) {
      fetchMemberships()
    }
  }, [open])

  const fetchMemberships = async () => {
    try {
      const response = await fetch('/api/memberships')
      const data = await response.json()
      setMemberships(data)
    } catch (error) {
      console.error('Failed to fetch memberships:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.membershipId || !formData.paymentMethod) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (including phone number)',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: '12345678',                    // Default password
          paymentCompleted: formData.paymentCompleted || false,  // Flag for instant verification
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register member')
      }

      toast({
        title: 'Success',
        description: 'Member registered successfully with default password 12345678',
      })

      setOpen(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        birthday: '',
        gender: '',
        membershipId: '',
        paymentMethod: '',
        fitnessGoals: [],
        fitnessGoalsDetails: '',
        startDate: new Date().toISOString().split('T')[0],
        paymentCompleted: true,
      })

      if (onMemberAdded) {
        onMemberAdded()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register member',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 px-6 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl transition-all shadow-xl shadow-[#daa857]/10">
          <UserPlus className="h-3.5 w-3.5 stroke-[3px]" />
          Enroll Member
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111] border-white/10 text-white rounded-[2.5rem] p-10 max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
            New Signature <span className="text-[#daa857]">Enrollment</span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium uppercase text-[10px] tracking-widest leading-relaxed">
            Establishing a new elite profile in the vault. Default security key: <span className="text-[#daa857] font-black">12345678</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">First Identity *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="FIRST NAME"
                className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Last Identity *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="LAST NAME"
                className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Comm Channel *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="EMAIL@PROTOCOL.COM"
                className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="phoneNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Secure Line *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="CONTACT NUMBER"
                className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Cycle of Origin</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.birthday?.split('-')[0] || ''}
                  onValueChange={(month) => {
                    const currentDay = formData.birthday?.split('-')[1] || '01'
                    const newDay = Number(currentDay) > 28 ? '01' : currentDay
                    setFormData({ ...formData, birthday: `${month}-${newDay.padStart(2, '0')}` })
                  }}
                >
                  <SelectTrigger className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px] flex-1">
                    <SelectValue placeholder="MONTH" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white">
                    {[
                      { value: '01', label: 'JAN' }, { value: '02', label: 'FEB' }, { value: '03', label: 'MAR' },
                      { value: '04', label: 'APR' }, { value: '05', label: 'MAY' }, { value: '06', label: 'JUN' },
                      { value: '07', label: 'JUL' }, { value: '08', label: 'AUG' }, { value: '09', label: 'SEP' },
                      { value: '10', label: 'OCT' }, { value: '11', label: 'NOV' }, { value: '12', label: 'DEC' },
                    ].map((m) => (
                      <SelectItem key={m.value} value={m.value} className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.birthday?.split('-')[1]?.padStart(2, '0') || ''}
                  onValueChange={(day) => {
                    const month = formData.birthday?.split('-')[0] || '01'
                    setFormData({ ...formData, birthday: `${month}-${day.padStart(2, '0')}` })
                  }}
                  disabled={!formData.birthday?.split('-')[0]}
                >
                  <SelectTrigger className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px] w-24">
                    <SelectValue placeholder="DAY" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white">
                    {(() => {
                      const month = formData.birthday?.split('-')[0] || '01'
                      const year = new Date().getFullYear()
                      const daysInMonth = new Date(Number(year), Number(month), 0).getDate()
                      return Array.from({ length: daysInMonth }, (_, i) => {
                        const dayNum = i + 1
                        const dayStr = dayNum.toString().padStart(2, '0')
                        return (
                          <SelectItem key={dayStr} value={dayStr} className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">
                            {dayNum}
                          </SelectItem>
                        )
                      })
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Gender Protocol</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger id="gender" className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px]">
                  <SelectValue placeholder="SELECT GENDER" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white">
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">
                      {opt.label.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="membership" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mission Tier *</Label>
              <Select
                value={formData.membershipId}
                onValueChange={(value) => setFormData({ ...formData, membershipId: value })}
              >
                <SelectTrigger id="membership" className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px]">
                  <SelectValue placeholder="SELECT TIER" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white">
                  {memberships.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">
                      {m.name.toUpperCase()} - ₦{m.price.toLocaleString('en-NG')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="paymentMethod" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Authorization *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger id="paymentMethod" className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px]">
                  <SelectValue placeholder="METHOD" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method} className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">
                      {method.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-3">
              <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Deployment Start *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px]"
                required
              />
            </div>
            <div className="flex items-center space-x-3 h-14 px-4 rounded-xl bg-black border border-white/5">
              <Checkbox
                id="payment-completed"
                checked={formData.paymentCompleted}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, paymentCompleted: !!checked }))}
                className="border-white/20 data-[state=checked]:bg-[#daa857] data-[state=checked]:text-black"
              />
              <Label
                htmlFor="payment-completed"
                className="text-[9px] font-black uppercase tracking-widest text-gray-500 cursor-pointer"
              >
                Instant Neural Verification & Activation
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="fitnessGoals" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mission Intelligence</Label>
            <Textarea
              id="fitnessGoals"
              value={formData.fitnessGoalsDetails}
              onChange={(e) => setFormData({ ...formData, fitnessGoalsDetails: e.target.value })}
              placeholder="SPECIFY TARGETS OR MEDICAL CONTRAINDICATIONS..."
              rows={3}
              className="bg-black border-white/5 rounded-2xl focus:border-[#daa857] p-6 font-bold text-xs uppercase tracking-widest"
            />
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Abort
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                'Finalize Enrollment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}