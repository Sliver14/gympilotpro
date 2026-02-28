'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Dumbbell, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

interface Membership {
  id: string
  name: string
  duration: number
  price: number
  description: string
}

export default function RenewMembershipPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const router = useRouter()
  const { toast } = useToast()

  const PAYMENT_METHODS = [
    { id: 'Bank Transfer', name: 'Bank Transfer', comingSoon: false },
    { id: 'POS', name: 'POS / Card', comingSoon: false },
    { id: 'Cash', name: 'Cash', comingSoon: false },
    { id: 'Paystack', name: 'Paystack', comingSoon: true },
  ]

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch('/api/memberships')
        const data = await response.json()
        setMemberships(data)
        if (data.length > 0) {
          setSelectedId(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching memberships:', error)
        toast({
          title: 'Error',
          description: 'Failed to load membership packages',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemberships()
  }, [toast])

  const selectedMembership = memberships.find((m) => m.id === selectedId)

  const handleRenew = async () => {
    if (!selectedId) {
      toast({
        title: 'Error',
        description: 'Please select a membership package',
        variant: 'destructive',
      })
      return
    }

    if (paymentMethod === 'Paystack') {
      toast({
        title: 'Coming Soon',
        description: 'Paystack payment is not yet available.',
      })
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      // Process payment (mock implementation)
      const response = await fetch('/api/payments/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: selectedId, paymentMethod }),
      })

      const data = await response.json()

      if (data.success) {
        setPaymentStatus('success')
        toast({
          title: 'Renewal Request Sent',
          description: data.message || 'Membership renewal request has been sent for approval.',
        })
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/member/dashboard')
        }, 3000)
      } else {
        setPaymentStatus('failed')
        toast({
          title: 'Renewal Failed',
          description: data.message || 'Failed to process renewal request',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('failed')
      toast({
        title: 'Error',
        description: 'An error occurred during renewal processing',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/member/dashboard')}
            className="gap-2 -ml-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold">Renew Membership</span>
        </div>

        {/* Status Alert */}
        {paymentStatus === 'success' && (
          <Card className="mb-8 border-green-600 bg-green-50 dark:bg-green-950/20">
            <CardContent className="flex items-center gap-4 pt-6">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-600">Membership Renewed!</p>
                <p className="text-sm text-muted-foreground">Your membership has been successfully renewed. Redirecting...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus === 'failed' && (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardContent className="flex items-center gap-4 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Payment Failed</p>
                <p className="text-sm text-muted-foreground">Please try again or contact support</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {/* Membership Selection */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Select Membership Package</h2>
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                  selectedId === membership.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedId(membership.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{membership.name}</h3>
                    <p className="text-sm text-muted-foreground">{membership.duration} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₦{membership.price.toLocaleString('en-NG')}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">{membership.description}</p>
              </div>
            ))}

            <h2 className="text-xl font-semibold mt-8">Select Payment Method</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${method.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => !method.comingSoon && setPaymentMethod(method.id)}
                >
                  <p className="font-medium text-sm">{method.name}</p>
                  {method.comingSoon && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-[8px] px-1 py-0 h-4">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            {paymentMethod === 'Bank Transfer' && (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 mt-4">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-500 mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Bank Transfer Instructions
                </p>
                <div className="text-xs text-yellow-700 dark:text-yellow-600 space-y-1">
                  <p>Account Name: KLIMARX SPACE ENTERPRISES</p>
                  <p>Bank: FIRST CITY MONUMENT BANK (FCMB)</p>
                  <p>Account Number: 1042020132</p>
                  <p className="mt-2 font-semibold">After payment, send your proof of transfer to WhatsApp: 07048430667</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMembership ? (
                  <>
                    <div className="space-y-3 rounded-lg border border-border p-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Package</span>
                        <span className="text-sm font-medium">{selectedMembership.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="text-sm font-medium">{selectedMembership.duration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Method</span>
                        <span className="text-sm font-medium">{paymentMethod}</span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">₦{selectedMembership.price.toLocaleString('en-NG')}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleRenew}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : 'Request Renewal'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Staff will verify your payment and activate your membership
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a package to continue</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Methods Info */}
        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• For manual payments (Bank Transfer, POS, Cash), your membership will be renewed once staff confirms the payment.</p>
            <p>• For faster verification of Bank Transfer, please send proof of payment to our WhatsApp line.</p>
            <p>• Membership expiry date will be calculated from the moment of approval.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
