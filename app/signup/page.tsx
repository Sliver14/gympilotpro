'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSignup } from '@/hooks/use-signup'
import { useToast } from '@/hooks/use-toast'
import { Dumbbell, ChevronRight, ChevronLeft, AlertTriangle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const PAYMENT_METHODS = [
  { id: 'Cash', name: 'Cash', comingSoon: false },
  { id: 'Bank Transfer', name: 'Bank Transfer', comingSoon: false },
  { id: 'POS / Card', name: 'POS / Card', comingSoon: false },
  { id: 'Paystack', name: 'Paystack', comingSoon: true },
]

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
  const { step, formData, isLoading: hookIsLoading, updateFormData, nextStep, prevStep } = useSignup()
  const { toast } = useToast()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loadingMemberships, setLoadingMemberships] = useState(true)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLoading = hookIsLoading || isSubmitting

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

  const validateStep = (stepNumber: number): boolean => {
    setError(null)
    setFieldErrors({})
    const errors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!formData.firstName?.trim()) errors.firstName = 'First name is required'
      if (!formData.lastName?.trim()) errors.lastName = 'Last name is required'
      if (!formData.email?.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required'
      if (!formData.gender) errors.gender = 'Gender is required'
    } else if (stepNumber === 2) {
      if (!formData.membershipId) errors.membershipId = 'Please select a membership package'
      if (!formData.paymentMethod) errors.paymentMethod = 'Please select a payment method'
    } else if (stepNumber === 3) {
      const goals = formData.fitnessGoals as string[] || []
      if (goals.length === 0 && !formData.fitnessGoalsDetails?.trim()) {
        errors.fitnessGoals = 'Please select at least one goal or describe your goals'
      }
    } else if (stepNumber === 4) {
      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long'
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
      if (!paymentConfirmed) {
        errors.paymentConfirmed = 'Please confirm that you have made or will make the payment'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Please fix the errors below before continuing')
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (!validateStep(step)) {
      return
    }
    setError(null)
    setFieldErrors({})
    nextStep()
  }

  const isBankTransfer = formData.paymentMethod === 'Bank Transfer'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo + Progress */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Klimarx Space</span>
        </Link>

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
            {/* Error Alert */}
            {(error || submitError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{error || submitError}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => {
                      setError(null)
                      setSubmitError(null)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => {
                        updateFormData({ firstName: e.target.value })
                        if (fieldErrors.firstName) {
                          setFieldErrors((prev) => {
                            const { firstName, ...rest } = prev
                            return rest
                          })
                        }
                        if (error) setError(null)
                      }}
                      className={cn(fieldErrors.firstName && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => {
                        updateFormData({ lastName: e.target.value })
                        if (fieldErrors.lastName) {
                          setFieldErrors((prev) => {
                            const { lastName, ...rest } = prev
                            return rest
                          })
                        }
                        if (error) setError(null)
                      }}
                      className={cn(fieldErrors.lastName && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender || ''}
                      onValueChange={(v) => {
                        updateFormData({ gender: v })
                        if (fieldErrors.gender) {
                          setFieldErrors((prev) => {
                            const { gender, ...rest } = prev
                            return rest
                          })
                        }
                        if (error) setError(null)
                      }}
                    >
                      <SelectTrigger className={cn(fieldErrors.gender && 'border-destructive focus-visible:ring-destructive')}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other / Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.gender && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.gender}
                      </p>
                    )}
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
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      updateFormData({ email: e.target.value })
                      if (fieldErrors.email) {
                          setFieldErrors((prev) => {
                            const { email, ...rest } = prev
                            return rest
                          })
                      }
                      if (error) setError(null)
                    }}
                    className={cn(fieldErrors.email && 'border-destructive focus-visible:ring-destructive')}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        updateFormData({ phoneNumber: e.target.value })
                        if (fieldErrors.phoneNumber) {
                            setFieldErrors((prev) => {
                              const { phoneNumber, ...rest } = prev
                              return rest
                            })
                        }
                        if (error) setError(null)
                      }}
                      className={cn(fieldErrors.phoneNumber && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {fieldErrors.phoneNumber && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Birthday (Optional)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.birthday?.split('-')[1] || ''}
                        onValueChange={(day) => {
                          const month = formData.birthday?.split('-')[0] || '01'
                          updateFormData({ birthday: `${month}-${day.padStart(2, '0')}` })
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
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
                          updateFormData({ birthday: `${month.padStart(2, '0')}-${day}` })
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'
                          ].map((m, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
                    <Label>Membership Package *</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      {memberships.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            'cursor-pointer rounded-lg border-2 p-4 transition-colors',
                            formData.membershipId === m.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50',
                            fieldErrors.membershipId && !formData.membershipId && 'border-destructive'
                          )}
                          onClick={() => {
                            updateFormData({ membershipId: m.id })
                            if (fieldErrors.membershipId) {
                              setFieldErrors((prev) => {
                              const { membershipId, ...rest } = prev
                              return rest
                            })
                            }
                            if (error) setError(null)
                          }}
                        >
                          <h3 className="font-semibold">{m.name}</h3>
                          <p className="text-2xl font-bold text-primary">₦{m.price.toLocaleString('en-NG')}</p>
                          <p className="text-xs text-muted-foreground">{m.duration} days</p>
                          <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                        </div>
                      ))}
                    </div>
                    {fieldErrors.membershipId && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.membershipId}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Payment Method (to be confirmed by staff) *</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method.id}
                        className={cn(
                          'relative cursor-pointer rounded-lg border-2 p-4 text-center transition-colors',
                          formData.paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50',
                          fieldErrors.paymentMethod && !formData.paymentMethod && 'border-destructive',
                          method.comingSoon && 'opacity-60 cursor-not-allowed'
                        )}
                        onClick={() => {
                          if (method.comingSoon) return
                          updateFormData({ paymentMethod: method.id })
                          setPaymentConfirmed(false)
                          if (fieldErrors.paymentMethod) {
                            setFieldErrors((prev) => {
                              const { paymentMethod, ...rest } = prev
                              return rest
                            })
                          }
                          if (error) setError(null)
                        }}
                      >
                        {method.name}
                        {method.comingSoon && (
                          <Badge variant="secondary" className="absolute -top-2 -right-2 text-[8px] px-1 py-0 h-4">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {fieldErrors.paymentMethod && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.paymentMethod}
                    </p>
                  )}

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

            {/* Step 3 – Goals */}
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
                          onCheckedChange={() => {
                            toggleGoal(goal.id)
                            if (fieldErrors.fitnessGoals) {
                              setFieldErrors((prev) => {
                              const { fitnessGoals, ...rest } = prev
                              return rest
                            })
                            }
                            if (error) setError(null)
                          }}
                        />
                        <Label htmlFor={goal.id} className="leading-tight cursor-pointer">
                          {goal.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {fieldErrors.fitnessGoals && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.fitnessGoals}
                    </p>
                  )}
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
                      onChange={(e) => {
                        updateFormData({ password: e.target.value })
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => {
                            const { password, ...rest } = prev
                            return rest
                          })
                        }
                        if (fieldErrors.confirmPassword && formData.confirmPassword === e.target.value) {
                          setFieldErrors((prev) => {
                            const { confirmPassword, ...rest } = prev
                            return rest
                          })
                        }
                        if (error) setError(null)
                      }}
                      className={cn(fieldErrors.password && 'border-destructive focus-visible:ring-destructive')}
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                    {fieldErrors.password && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        updateFormData({ confirmPassword: e.target.value })
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => {
                            const { confirmPassword, ...rest } = prev
                            return rest
                          })
                        }
                        if (error) setError(null)
                      }}
                      className={cn(fieldErrors.confirmPassword && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Confirmation Checkbox */}
                <div className={cn(
                  'flex items-start space-x-3 rounded-lg border p-4',
                  fieldErrors.paymentConfirmed && 'border-destructive'
                )}>
                  <Checkbox
                    id="payment-confirmed"
                    checked={paymentConfirmed}
                    onCheckedChange={(checked) => {
                      setPaymentConfirmed(!!checked)
                      if (fieldErrors.paymentConfirmed) {
                        setFieldErrors((prev) => {
                          const { paymentConfirmed, ...rest } = prev
                          return rest
                        })
                      }
                      if (error) setError(null)
                    }}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="payment-confirmed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I confirm that I have made the payment (or will do so shortly for Bank Transfer / Cash / POS) *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isBankTransfer
                        ? 'Please send proof via WhatsApp after transfer to speed up verification.'
                        : 'Staff will verify your payment shortly after signup.'}
                    </p>
                  </div>
                </div>
                {fieldErrors.paymentConfirmed && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.paymentConfirmed}
                  </p>
                )}

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
                  onClick={async () => {
                    setSubmitError(null)
                    setError(null)
                    setFieldErrors({})

                    // Validate step 4 before submitting
                    if (!validateStep(4)) {
                      return
                    }

                    setIsSubmitting(true)
                    try {
                      // Make the API call directly to capture errors
                      const response = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: formData.email,
                          firstName: formData.firstName,
                          lastName: formData.lastName,
                          phoneNumber: formData.phoneNumber,
                          birthday: formData.birthday,
                          gender: formData.gender,
                          hearAboutUs: formData.hearAboutUs,
                          membershipId: formData.membershipId,
                          paymentMethod: formData.paymentMethod,
                          fitnessGoals: formData.fitnessGoals,
                          fitnessGoalsDetails: formData.fitnessGoalsDetails,
                          emergencyContact: formData.emergencyContact,
                          emergencyPhone: formData.emergencyPhone,
                          password: formData.password,
                        }),
                      })

                      const data = await response.json()

                      if (!response.ok) {
                        setSubmitError(data.error || 'Failed to create account. Please try again.')
                        toast({
                          title: 'Signup Failed',
                          description: data.error || 'An unknown error occurred. Please try again.',
                          variant: 'destructive',
                        })
                        setIsSubmitting(false)
                        return
                      }

                      // Success - show success message and redirect
                      if (data.bankInstructions) {
                        toast({
                          title: 'Account Created! Action Required.',
                          description: 'Please follow bank transfer instructions to complete your registration. You will be redirected shortly.',
                          duration: 15000,
                        })
                      } else {
                        toast({
                          title: 'Account Created!',
                          description: 'Your registration is pending payment verification by our staff.',
                          duration: 10000,
                        })
                      }

                      // Redirect to login page after a delay
                      setTimeout(() => {
                        window.location.href = '/login'
                      }, 5000)
                    } catch (error: any) {
                      const errorMessage = error.message || 'Network error. Please check your connection and try again.'
                      setSubmitError(errorMessage)
                      toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                      })
                      setIsSubmitting(false)
                    }
                  }}
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