'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface PaymentDetails {
  amount: number
  membershipName: string
  duration: number
  memberEmail: string
}

function PaymentPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')

  useEffect(() => {
    // In a real implementation, you'd fetch payment details from your backend
    const amount = searchParams.get('amount')
    const membershipName = searchParams.get('membership') || 'Standard'
    const duration = searchParams.get('duration') || '30'
    const memberEmail = searchParams.get('email') || ''

    if (amount && memberEmail) {
      setPaymentDetails({
        amount: parseFloat(amount),
        membershipName,
        duration: parseInt(duration),
        memberEmail,
      })
    } else {
      toast({
        title: 'Error',
        description: 'Payment details not found',
        variant: 'destructive',
      })
      router.push('/signup')
    }
  }, [searchParams, router, toast])

  const handlePayment = async () => {
    if (!paymentDetails) return

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      // Mock payment processing
      // In production, this would integrate with Paystack
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful payment
      const isSuccess = Math.random() > 0.1 // 90% success rate for demo

      if (isSuccess) {
        setPaymentStatus('success')
        toast({
          title: 'Payment Successful',
          description: 'Your membership is now active',
        })

        // Redirect to member dashboard after 2 seconds
        setTimeout(() => {
          router.push('/member/dashboard')
        }, 2000)
      } else {
        setPaymentStatus('failed')
        toast({
          title: 'Payment Failed',
          description: 'Please try again or contact support',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('failed')
      toast({
        title: 'Error',
        description: 'Payment processing error',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!paymentDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Image 
            src="/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png" 
            alt="Gym Logo" 
            width={48} 
            height={48} 
            className="object-contain"
          />
          <span className="text-2xl font-bold uppercase tracking-wider text-primary">Gym Checkout</span>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <Card className="mb-6 border-green-600 bg-green-50 dark:bg-green-950/20">
            <CardContent className="flex items-center gap-4 pt-6">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus === 'failed' && (
          <Card className="mb-6 border-destructive bg-destructive/5">
            <CardContent className="flex items-center gap-4 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Payment Failed</p>
                <p className="text-sm text-muted-foreground">Please try again</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Your Payment
            </CardTitle>
            <CardDescription>Secure payment processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Summary */}
            <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Membership Plan</p>
                <p className="font-semibold">{paymentDetails.membershipName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold">{paymentDetails.duration} days</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">Amount to Pay</p>
                <p className="text-2xl font-bold text-primary">${paymentDetails.amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <Badge variant="secondary" className="mb-2">
                Demo Mode
              </Badge>
              <p className="text-xs text-muted-foreground">
                This is a demo payment. In production, this integrates with Paystack for real payments.
              </p>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing || paymentStatus === 'success'}
              className="w-full gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Processing Payment...
                </>
              ) : paymentStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Payment Complete
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Payment is secure and encrypted
            </p>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground space-y-2">
                <div>🔒 Secure payment gateway</div>
                <div>✓ SSL encrypted connection</div>
                <div>✓ PCI DSS compliant</div>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  // Wrap the client component that uses useSearchParams in a Suspense boundary
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      }
    >
      <PaymentPageInner />
    </Suspense>
  )
}
