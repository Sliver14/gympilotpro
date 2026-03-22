'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, CheckCircle, RefreshCw, AlertCircle, Phone, Mail, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PendingPayment {
  id: string
  amount: number
  paymentMethod: string
  description: string
  reference: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
  }
}

export default function PendingPayments({ onPaymentProcessed }: { onPaymentProcessed?: () => void }) {
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const { toast } = useToast()
  const today = new Date().toISOString().split('T')[0]

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/pending-payments')
      const data = await response.json()
      if (response.ok) {
        setPayments(data)
      } else {
        throw new Error(data.error || 'Failed to fetch pending payments')
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load pending payments',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [toast])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/payments/approve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate }),
      })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Payment approved successfully',
        })
        setSelectedPayment(null)
        fetchPayments()
        if (onPaymentProcessed) onPaymentProcessed()
      } else {
        throw new Error(data.error || 'Failed to approve payment')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve payment',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#daa857]" /> Update <span className="text-[#daa857]">Queue</span>
            </CardTitle>
            <CardDescription>{payments.length} inbound payments awaiting verification</CardDescription>
          </div>
          <Button 
            onClick={fetchPayments} 
            variant="outline" 
            size="sm" 
            className="h-10 px-4 border-border bg-background hover:bg-accent text-muted-foreground font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Update
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 rounded-[2rem] border border-dashed border-border">
            <CheckCircle className="h-12 w-12 text-gray-800 mb-4 opacity-20" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest italic">All systems updated. No pending transactions.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-3xl bg-card/50 border border-border p-6 hover:border-[#daa857]/30 transition-all group relative overflow-hidden">
                <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent blur-2xl group-hover:bg-[#daa857]/5 transition-colors" />
                
                <div className="space-y-4 flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-3">
                    <p className="font-black text-foreground uppercase italic tracking-tight text-lg">
                      {payment.user.firstName} <span className="text-[#daa857]">{payment.user.lastName}</span>
                    </p>
                    <Badge className="bg-[#daa857]/10 text-[#daa857] border-[#daa857]/20 text-[8px] font-black uppercase tracking-widest px-2">
                      {payment.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-baseline gap-4">
                    <p className="text-2xl font-black text-foreground italic tracking-tighter">
                      ₦{payment.amount.toLocaleString('en-NG')}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic truncate max-w-xs">
                      {payment.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                      <Mail className="h-3 w-3 text-[#daa857]/50" />
                      {payment.user.email}
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                      <Phone className="h-3 w-3 text-[#daa857]/50" />
                      {payment.user.phoneNumber}
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#daa857]/70">
                      <AlertCircle className="h-3 w-3" />
                      REF: {payment.reference.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 md:mt-0 relative z-10">
                  <Button 
                    disabled={!!processingId}
                    className="flex-1 md:flex-none h-14 px-8 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 shadow-xl shadow-[#daa857]/10"
                    onClick={() => {
                      setSelectedPayment(payment)
                      setStartDate(new Date().toISOString().split('T')[0])
                    }}
                  >
                    {processingId === payment.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2 stroke-[3px]" />
                    )}
                    Authorize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="bg-card border-border text-foreground rounded-[2.5rem] p-10 max-w-lg">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Manual <span className="text-[#daa857]">Authorization</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-relaxed">
                Confirm payload verification for <span className="text-foreground font-black">{selectedPayment?.user.firstName} {selectedPayment?.user.lastName}</span>
                <br />Amount: <span className="text-[#daa857] font-black">₦{selectedPayment?.amount.toLocaleString('en-NG')}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-8 py-8">
              <div className="space-y-3">
                <Label htmlFor="startDate" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  <CalendarIcon className="h-3.5 w-3.5 text-[#daa857]" />
                  Plan Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={today}
                  className="h-16 bg-background border-border rounded-2xl focus:border-[#daa857] px-6 font-black uppercase tracking-widest text-sm"
                />
                <div className="p-4 rounded-xl bg-[#daa857]/5 border border-[#daa857]/10">
                  <p className="text-[9px] font-bold text-[#daa857]/70 uppercase tracking-widest leading-relaxed">
                    The system will automatically calculate expiry based on the member's selected plan from this timestamp.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPayment(null)}
                className="h-14 px-8 border-border hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Abort
              </Button>
              <Button 
                onClick={() => selectedPayment && handleApprove(selectedPayment.id)}
                disabled={!!processingId}
                className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
              >
                {processingId ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
