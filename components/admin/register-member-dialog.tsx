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
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Register Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Member</DialogTitle>
          <DialogDescription>
            Create a new member account. The default password will be 12345678.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="08012345678"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Birthday (Optional)</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.birthday?.split('-')[1] || ''}
                  onValueChange={(day) => {
                    const month = formData.birthday?.split('-')[0] || '01'
                    setFormData({ ...formData, birthday: `${month}-${day.padStart(2, '0')}` })
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.birthday?.split('-')[0] || ''}
                  onValueChange={(month) => {
                    const day = formData.birthday?.split('-')[1] || '01'
                    setFormData({ ...formData, birthday: `${month.padStart(2, '0')}-${day}` })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ].map((m, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Membership Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Instant verification checkbox (admin-only feature) */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="payment-completed"
              checked={formData.paymentCompleted}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, paymentCompleted: !!checked }))}
            />
            <Label
              htmlFor="payment-completed"
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark payment as completed (instant verification & activation)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fitnessGoals">Fitness Goals / Details</Label>
            <Textarea
              id="fitnessGoals"
              value={formData.fitnessGoalsDetails}
              onChange={(e) => setFormData({ ...formData, fitnessGoalsDetails: e.target.value })}
              placeholder="Any specific goals or medical conditions?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}