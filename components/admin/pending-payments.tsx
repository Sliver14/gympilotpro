'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, CheckCircle, RefreshCw, AlertCircle, Phone, Mail, Calendar as CalendarIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pending Payments
            </CardTitle>
            <CardDescription>Members awaiting payment confirmation</CardDescription>
          </div>
          <Button onClick={fetchPayments} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground font-medium">No pending payments</p>
            <p className="text-xs text-muted-foreground">Everything is up to date!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border border-border p-4 gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">
                      {payment.user.firstName} {payment.user.lastName}
                    </p>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {payment.paymentMethod}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    ₦{payment.amount.toLocaleString('en-NG')}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {payment.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {payment.user.email}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {payment.user.phoneNumber}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      Ref: {payment.reference}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:self-center">
                  <Button 
                    disabled={!!processingId}
                    className="flex-1 md:flex-none"
                    onClick={() => {
                      setSelectedPayment(payment)
                      setStartDate(new Date().toISOString().split('T')[0])
                    }}
                  >
                    {processingId === payment.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Payment</DialogTitle>
              <DialogDescription>
                Confirm approval for <strong>{selectedPayment?.user.firstName} {selectedPayment?.user.lastName}</strong>'s payment of <strong>₦{selectedPayment?.amount.toLocaleString('en-NG')}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Membership Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  The expiry date will be automatically calculated based on the member's package duration from this start date.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>Cancel</Button>
              <Button 
                onClick={() => selectedPayment && handleApprove(selectedPayment.id)}
                disabled={!!processingId}
              >
                {processingId ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
