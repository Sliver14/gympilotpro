'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useSignup } from '@/hooks/use-signup'
import { useToast } from '@/hooks/use-toast'
import { Dumbbell, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react'

interface Membership {
  id: string
  name: string
  duration: number
  price: number
  description: string
}

const FITNESS_GOALS_OPTIONS = [
  { id: 'weight_loss', label: 'Weight Loss / Fat Burning' },
  { id: 'muscle_gain', label: 'Muscle Gain / Hypertrophy' },
  { id: 'strength_endurance', label: 'Strength & Muscle Stamina' },
  { id: 'full_body', label: 'Full Body Workout / General Fitness' },
  { id: 'flexibility', label: 'Improve Flexibility & Mobility' },
  { id: 'endurance', label: 'Cardio Endurance / Stamina' },
  { id: 'sport_specific', label: 'Sport-Specific Training' },
]

const HEAR_ABOUT_US_OPTIONS = [
  'Friend / Family',
  'Social Media (Instagram, Facebook, etc.)',
  'Flyer / Poster',
  'Google Search',
  'Gym Referral / Walk-in',
  'WhatsApp / Broadcast',
  'Other',
]

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS / Card']

const BANK_TRANSFER_DETAILS = `KLIMARX SPACE ENTERPRISES
FIRST CITY MONUMENT BANK (FCMB)
1042020132

Please ensure you confirm the account name before making any transfer.

After payment, kindly send your payment receipt/proof of transfer to:

WhatsApp: 07048430667

This will enable us to update your membership promptly.

Thank you for your cooperation and continued support.
We look forward to helping you achieve your fitness goals

Signed: Management Klimarx Space Enterprises`

export default function SignupPage() {
  const { step, formData, isLoading, updateFormData, nextStep, prevStep, submitSignup } = useSignup()
  const { toast } = useToast()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loadingMemberships, setLoadingMemberships] = useState(true)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch('/api/memberships')
        const data = await response.json()
        setMemberships(data)
      } catch (error) {
        console.error('Failed to fetch memberships:', error)
        toast({
          title: 'Error',
          description: 'Failed to load membership packages',
          variant: 'destructive',
        })
      } finally {
        setLoadingMemberships(false)
      }
    }

    fetchMemberships()
  }, [toast])

  const toggleGoal = (goalId: string) => {
    const current = (formData.fitnessGoals as string[]) || []
    const updated = current.includes(goalId)
      ? current.filter((id) => id !== goalId)
      : [...current, goalId]
    updateFormData({ fitnessGoals: updated })
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.gender) {
        toast({
          title: 'Error',
          description: 'Please complete all required personal fields (including gender)',
          variant: 'destructive',
        })
        return
      }
    } else if (step === 2) {
      if (!formData.membershipId || !formData.paymentMethod) {
        toast({
          title: 'Error',
          description: 'Please select both a membership package and payment method',
          variant: 'destructive',
        })
        return
      }
    } else if (step === 3) {
      const goals = formData.fitnessGoals as string[] || []
      if (goals.length === 0 && !formData.fitnessGoalsDetails?.trim()) {
        toast({
          title: 'Error',
          description: 'Please select at least one goal or describe your goals',
          variant: 'destructive',
        })
        return
      }
    }

    nextStep()
  }

  const isBankTransfer = formData.paymentMethod === 'Bank Transfer'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo + Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Klimarx Space</span>
        </div>

        <div className="mb-8 flex justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                  step >= s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {s}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {s === 1 && 'Personal'}
                {s === 2 && 'Plan & Payment'}
                {s === 3 && 'Goals'}
                {s === 4 && 'Security'}
              </p>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Choose Plan & Payment'}
              {step === 3 && 'Your Fitness Goals'}
              {step === 4 && 'Complete Registration'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Let us know more about you'}
              {step === 2 && 'Select your membership and how you plan to pay (to be confirmed by staff)'}
              {step === 3 && 'What are you looking to achieve?'}
              {step === 4 && 'Create your account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                {/* ... unchanged personal info fields ... */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => updateFormData({ firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => updateFormData({ lastName: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender || ''} onValueChange={(v) => updateFormData({ gender: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other / Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
                    <Select value={formData.hearAboutUs || ''} onValueChange={(v) => updateFormData({ hearAboutUs: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {HEAR_ABOUT_US_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => updateFormData({ email: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={(e) => updateFormData({ phoneNumber: e.target.value })} />
                </div>
              </div>
            )}

            {/* Step 2 – Membership & Payment */}
            {step === 2 && (
              <div className="space-y-6">
                {loadingMemberships ? (
                  <p className="text-center text-muted-foreground">Loading plans...</p>
                ) : (
                  <div className="space-y-4">
                    <Label>Membership Package</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      {memberships.map((m) => (
                        <div
                          key={m.id}
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                            formData.membershipId === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => updateFormData({ membershipId: m.id })}
                        >
                          <h3 className="font-semibold">{m.name}</h3>
                          <p className="text-2xl font-bold text-primary">#{m.price}</p>
                          <p className="text-xs text-muted-foreground">{m.duration} days</p>
                          <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Payment Method (to be confirmed by staff)</Label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method}
                        className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                          formData.paymentMethod === method ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          updateFormData({ paymentMethod: method })
                          // Reset confirmation when method changes
                          setPaymentConfirmed(false)
                        }}
                      >
                        {method}
                      </div>
                    ))}
                  </div>

                  {/* Bank Transfer Instructions */}
                  {isBankTransfer && (
                    <Card className="border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-950/30">
                      <CardContent className="pt-6 space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="space-y-2 whitespace-pre-line">
                            {BANK_TRANSFER_DETAILS}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Payment will be verified by our staff after registration.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 – Goals (unchanged) */}
            {step === 3 && (
<div className="space-y-6">
                <div className="space-y-3">
                  <Label>Select your main fitness goal(s):</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {FITNESS_GOALS_OPTIONS.map((goal) => (
                      <div key={goal.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={goal.id}
                          checked={(formData.fitnessGoals as string[])?.includes(goal.id)}
                          onCheckedChange={() => toggleGoal(goal.id)}
                        />
                        <Label htmlFor={goal.id} className="leading-tight cursor-pointer">
                          {goal.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fitnessGoalsDetails">More details / Other goals</Label>
                  <Textarea
                    id="fitnessGoalsDetails"
                    placeholder="Any injuries, specific targets (e.g. lose 10kg, run 5km, squat 100kg), preferred training style, etc."
                    value={formData.fitnessGoalsDetails || ''}
                    onChange={(e) => updateFormData({ fitnessGoalsDetails: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact || ''}
                      onChange={(e) => updateFormData({ emergencyContact: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone (Optional)</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone || ''}
                      onChange={(e) => updateFormData({ emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 – Security + Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateFormData({ password: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                {/* Payment Confirmation Checkbox */}
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="payment-confirmed"
                    checked={paymentConfirmed}
                    onCheckedChange={(checked) => setPaymentConfirmed(!!checked)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="payment-confirmed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I confirm that I have made the payment (or will do so shortly for Bank Transfer / Cash / POS)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isBankTransfer
                        ? 'Please send proof via WhatsApp after transfer to speed up verification.'
                        : 'Staff will verify your payment shortly after signup.'}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
                  <p className="font-semibold">Review Your Information</p>
                  <p><span className="text-muted-foreground">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="text-muted-foreground">Gender:</span> {formData.gender}</p>
                  <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {formData.phoneNumber}</p>
                  <p><span className="text-muted-foreground">Heard from:</span> {formData.hearAboutUs || '—'}</p>
                  <p><span className="text-muted-foreground">Membership:</span> {memberships.find(m => m.id === formData.membershipId)?.name || '—'}</p>
                  <p><span className="text-muted-foreground">Payment:</span> {formData.paymentMethod || '—'}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep} disabled={isLoading} className="gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}

              {step < 4 && (
                <Button onClick={handleNextStep} disabled={isLoading} className="flex-1 gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {step === 4 && (
                <Button
                  onClick={submitSignup}
                  disabled={isLoading || !paymentConfirmed}
                  className="flex-1"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}