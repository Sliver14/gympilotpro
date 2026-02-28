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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw, Wallet } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface Membership {
  id: string
  name: string
  price: number
  duration: number
}

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS / Card']

export default function ManualRenewalDialog({ memberId, memberName, onRenewed }: { memberId: string, memberName: string, onRenewed?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    membershipId: '',
    paymentMethod: 'Cash',
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

    if (!formData.membershipId || !formData.paymentMethod) {
      toast({
        title: 'Error',
        description: 'Please select a membership plan and payment method',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/payments/renew-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to renew membership')
      }

      toast({
        title: 'Success',
        description: data.message || 'Membership renewed successfully',
      })

      setOpen(false)
      if (onRenewed) onRenewed()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to renew membership',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Renew
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Renewal for {memberName}</DialogTitle>
          <DialogDescription>
            Select a membership plan and record the payment. This will instantly activate their membership.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="membership">Membership Plan *</Label>
            <Select
              value={formData.membershipId}
              onValueChange={(value) => setFormData({ ...formData, membershipId: value })}
            >
              <SelectTrigger id="membership">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {memberships.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} - ₦{m.price.toLocaleString('en-NG')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              Renew Membership
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
