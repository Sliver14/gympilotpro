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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw, Wallet, Loader2 } from 'lucide-react'
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
    startDate: new Date().toISOString().split('T')[0],
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

    if (!formData.membershipId || !formData.paymentMethod || !formData.startDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
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
      setFormData({
        membershipId: '',
        paymentMethod: 'Cash',
        startDate: new Date().toISOString().split('T')[0],
      })
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

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-10 px-6 border-red-500/20 bg-background hover:bg-red-500 hover:text-foreground text-red-500 font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Renew
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground rounded-[2.5rem] p-5 md:p-10 max-w-lg">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
            Manual <span className="text-[#daa857]">Renewal</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-relaxed">
            Renewing membership for <span className="text-foreground font-black">{memberName}</span>.
            Confirm membership plan and start date.          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          <div className="space-y-3">
            <Label htmlFor="membership" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Membership Plan *</Label>
            <Select
              value={formData.membershipId}
              onValueChange={(value) => setFormData({ ...formData, membershipId: value })}
            >
              <SelectTrigger id="membership" className="h-16 bg-background border-border rounded-2xl focus:border-[#daa857] px-6 font-black uppercase tracking-widest text-xs">
                <SelectValue placeholder="SELECT PLAN" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {memberships.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px] tracking-widest">
                    {m.name.toUpperCase()} - ₦{m.price.toLocaleString('en-NG')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                max={today}
                className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px]"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="paymentMethod" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Authorization *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger id="paymentMethod" className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-4 font-black uppercase tracking-widest text-[10px]">
                  <SelectValue placeholder="METHOD" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method} className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px] tracking-widest">
                      {method.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="h-14 px-8 border-border hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                'Commit Renewal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
