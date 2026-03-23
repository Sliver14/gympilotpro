'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSignup } from '@/hooks/use-signup'
import { useToast } from '@/hooks/use-toast'
import { 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  AlertCircle, 
  Camera, 
  Loader2, 
  User, 
  CreditCard, 
  ShieldCheck, 
  Target, 
  Mail, 
  Phone, 
  ArrowRight,
  Crop as CropIcon,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Cropper, { Area } from 'react-easy-crop'
import getCroppedImg from '@/lib/image-utils'
import { Slider } from '@/components/ui/slider'

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

const BANK_TRANSFER_DETAILS = `KLIMARX SPACE ENTERPRISES
FIRST CITY MONUMENT BANK (FCMB)
1042020132`

import { useGym } from '@/components/gym-provider'

export default function SignupPage() {
  const { gymData, isLoading: gymLoading } = useGym()
  const { step, formData, isLoading: hookIsLoading, updateFormData, nextStep, prevStep } = useSignup()
  const { toast } = useToast()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loadingMemberships, setLoadingMemberships] = useState(true)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isLoading = hookIsLoading || isSubmitting
  
  // Cropper state
  const [isCropperModalOpen, setIsCropperModalOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const accent = gymData?.primaryColor || '#daa857'
  const dark = gymData?.secondaryColor || '#000000'
  const logoUrl = gymData?.logo
  const gymName = gymData?.name || 'Klimarx Space'
  const gymInitials = gymName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const hasPaystack = gymData?.hasPaystack || false

  const PAYMENT_METHODS = [
    { id: 'Cash', name: 'Cash', isEnabled: true },
    { id: 'Bank Transfer', name: 'Bank Transfer', isEnabled: true },
    { id: 'POS / Card', name: 'POS / Card', isEnabled: true },
    { id: 'Paystack', name: 'Paystack', isEnabled: hasPaystack, errorLabel: 'Not Configured' },
  ]

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File size should be less than 5MB', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result as string)
      setIsCropperModalOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    setUploading(true)
    setIsCropperModalOpen(false)

    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)
      if (!croppedImageBlob) throw new Error('Failed to crop image')

      const croppedFile = new File([croppedImageBlob], 'signup_profile.jpg', { type: 'image/jpeg' })
      
      const formDataUpload = new FormData()
      formDataUpload.append('file', croppedFile)
      formDataUpload.append('isSignup', 'true')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      
      updateFormData({ profileImage: data.imageUrl })
      setPreviewUrl(URL.createObjectURL(croppedImageBlob))
      toast({ title: 'Upload Complete', description: 'Profile picture uploaded.' })
    } catch (error) {
      console.error('Crop/Upload error:', error)
      toast({ title: 'Upload Error', description: 'Failed to upload profile picture.', variant: 'destructive' })
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      setImageToCrop(null)
    }
  }

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch('/api/memberships')
        const data = await response.json()
        setMemberships(data)
      } catch (error) {
        console.error('Failed to fetch memberships:', error)
      } finally {
        setLoadingMemberships(false)
      }
    }
    fetchMemberships()
  }, [])

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
      if (!formData.firstName?.trim()) errors.firstName = 'Required'
      if (!formData.lastName?.trim()) errors.lastName = 'Required'
      if (!formData.email?.trim()) {
        errors.email = 'Required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email'
      }
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = 'Required'
      if (!formData.gender) errors.gender = 'Required'
      if (!formData.profileImage) errors.profileImage = 'Image required'
    } else if (stepNumber === 2) {
      if (!formData.membershipId) errors.membershipId = 'Select a package'
      if (!formData.paymentMethod) errors.paymentMethod = 'Select payment method'
    } else if (stepNumber === 3) {
      const goals = formData.fitnessGoals as string[] || []
      if (goals.length === 0 && !formData.fitnessGoalsDetails?.trim()) {
        errors.fitnessGoals = 'Select a goal or describe one'
      }
    } else if (stepNumber === 4) {
      if (!formData.password) {
        errors.password = 'Required'
      } else if (formData.password.length < 8) {
        errors.password = 'Min 8 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Mismatch'
      }
      if (!paymentConfirmed) {
        errors.paymentConfirmed = 'Required'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (!validateStep(step)) {
      toast({
        title: 'Form Error',
        description: 'Please correct the issues before advancing.',
        variant: 'destructive',
      })
      return
    }
    nextStep()
    window.scrollTo(0, 0)
  }

  const isBankTransfer = formData.paymentMethod === 'Bank Transfer'

  const bankDetailsMessage = gymData?.bankName && gymData?.accountNumber && gymData?.accountName
    ? `${gymData.accountName}\n${gymData.bankName}\n${gymData.accountNumber}`
    : 'Bank details not configured. Please contact management.'

  if (gymLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#daa857]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#daa857]/30 px-4 py-12 md:py-20">
      <div className="mx-auto w-full max-w-4xl">
        
        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-center gap-4 md:gap-6">
          <Link href="/" className="group flex flex-col items-center gap-3">
             <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 flex items-center justify-center p-1 transition-transform group-hover:scale-110" style={{ borderColor: `${accent}80`, backgroundColor: logoUrl  ? 'white' : 'hsl(var(--card))' }}>
              {logoUrl ? (
                <Image 
                  src={logoUrl} 
                  alt="Logo" 
                  fill
                  className="object-contain p-1"
                />
              ) : (
                <span className="font-black italic text-xl" style={{ color: accent }}>{gymInitials}</span>
              )}
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Apply for <span style={{ color: accent }}>Membership</span></h1>
          </Link>

          {/* Progress Steps */}
          <div className="relative flex w-full max-w-2xl justify-between px-4 mt-4">
             {/* Progress Line */}
            <div className="absolute top-5 left-8 right-8 h-[2px] bg-accent z-0" />
            <div 
              className="absolute top-5 left-8 h-[2px] bg-[#daa857] z-0 transition-all duration-500" 
              style={{ width: `${(step - 1) * 33.33}%` }}
            />

            {[
              { s: 1, icon: User, label: 'Bio' },
              { s: 2, icon: CreditCard, label: 'Plan' },
              { s: 3, icon: Target, label: 'Goals' },
              { s: 4, icon: ShieldCheck, label: 'Safety' }
            ].map((item) => (
              <div key={item.s} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500",
                    step >= item.s ? "border-[#daa857] bg-[#daa857] text-black" : "border-border bg-card text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span className={cn(
                  "text-[10px] font-black",
                  step >= item.s ? "text-[#daa857]" : "text-muted-foreground"
                )}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card border border-border rounded-[2.5rem] p-4 md:p-6 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px]">
           <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#daa857]/5 blur-[100px]" />
           
           <div className="relative z-10">
             {(error || submitError) && (
               <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                 <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                 <p className="text-xs font-bold text-red-500 leading-tight">{error || submitError}</p>
               </div>
             )}
             
             {/* Step 1: Personal */}
             {step === 1 && (
               <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="relative group shrink-0">
                      <Avatar className={cn(
                        "h-44 w-44 border-4 transition-all duration-500",
                        fieldErrors.profileImage ? "border-red-500" : "border-[#daa857]/30 group-hover:border-[#daa857]"
                      )}>
                        <AvatarImage src={previewUrl || formData.profileImage} className="object-cover" />
                        <AvatarFallback className="text-2xl md:text-4xl bg-background font-black uppercase italic">
                          {formData.firstName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 h-12 w-12 rounded-full bg-[#daa857] text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                      >
                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
                    </div>
                    
                    <div className="flex-1 space-y-6 w-full">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">First Name</Label>
                            <Input 
                              placeholder="First Name" 
                              value={formData.firstName}
                              onChange={(e) => updateFormData({ firstName: e.target.value })}
                              className={cn("h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold", fieldErrors.firstName && "border-red-500")}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Last Name</Label>
                            <Input 
                              placeholder="Last Name" 
                              value={formData.lastName}
                              onChange={(e) => updateFormData({ lastName: e.target.value })}
                              className={cn("h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold", fieldErrors.lastName && "border-red-500")}
                            />
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Gender</Label>
                            <Select value={formData.gender} onValueChange={(v) => updateFormData({ gender: v })}>
                              <SelectTrigger className={cn("h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold", fieldErrors.gender && "border-red-500")}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border text-foreground">
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Phone</Label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="Contact Number" 
                                value={formData.phoneNumber}
                                onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                                className={cn("h-14 bg-background border-border rounded-xl focus:border-[#daa857] pl-12 font-bold", fieldErrors.phoneNumber && "border-red-500")}
                              />
                            </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="your@email.com" 
                          value={formData.email}
                          onChange={(e) => updateFormData({ email: e.target.value })}
                          className={cn("h-14 bg-background border-border rounded-xl focus:border-[#daa857] pl-12 font-bold", fieldErrors.email && "border-red-500")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                       <div className="space-y-1">
                         <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">How did you find us?</Label>
                         <Select value={formData.hearAboutUs} onValueChange={(v) => updateFormData({ hearAboutUs: v })}>
                           <SelectTrigger className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold">
                             <SelectValue placeholder="Select Source" />
                           </SelectTrigger>
                           <SelectContent className="bg-card border-border text-foreground">
                             {HEAR_ABOUT_US_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                           </SelectContent>
                         </Select>
                       </div>
                       
                       <div className="space-y-1">
                         <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Birthday (Optional)</Label>
                         <div className="flex gap-2">
                            <Select 
                              value={formData.birthday?.split('-')[0]} 
                              onValueChange={(m) => {
                                const d = formData.birthday?.split('-')[1] || '01'
                                updateFormData({ birthday: `${m}-${d}` })
                              }}
                            >
                              <SelectTrigger className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-4 font-bold flex-1">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border text-foreground">
                                {Array.from({length: 12}, (_, i) => {
                                  const m = (i+1).toString().padStart(2, '0')
                                  return <SelectItem key={m} value={m}>{new Date(2000, i).toLocaleString('default', {month: 'short'})}</SelectItem>
                                })}
                              </SelectContent>
                            </Select>
                            <Select 
                              value={formData.birthday?.split('-')[1]} 
                              onValueChange={(d) => {
                                const m = formData.birthday?.split('-')[0] || '01'
                                updateFormData({ birthday: `${m}-${d}` })
                              }}
                            >
                              <SelectTrigger className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-4 font-bold w-24">
                                <SelectValue placeholder="DD" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border text-foreground">
                                {Array.from({length: 31}, (_, i) => {
                                  const d = (i+1).toString().padStart(2, '0')
                                  return <SelectItem key={d} value={d}>{d}</SelectItem>
                                })}
                              </SelectContent>
                            </Select>
                         </div>
                       </div>
                    </div>
                 </div>
               </div>
             )}

             {/* Step 2: Plan */}
             {step === 2 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memberships.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => updateFormData({ membershipId: m.id })}
                        className={cn(
                          "group cursor-pointer rounded-2xl p-4 md:p-6 border-2 transition-all duration-300",
                          formData.membershipId === m.id 
                            ? "bg-[#daa857] border-[#daa857] text-black" 
                            : "bg-background border-border text-foreground hover:border-[#daa857]/50"
                        )}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-black uppercase italic text-lg">{m.name}</h3>
                          {formData.membershipId === m.id && <ShieldCheck className="h-5 w-5" />}
                        </div>
                        <div className="mb-4">
                          <span className="text-3xl font-black italic">₦{m.price.toLocaleString()}</span>
                          <span className={cn("text-[10px] font-black ml-2 opacity-60")}>/ {m.duration} Days</span>
                        </div>
                        <p className={cn("text-xs font-bold leading-relaxed", formData.membershipId === m.id ? "text-black/70" : "text-muted-foreground group-hover:text-muted-foreground")}>
                          {m.description}
                        </p>
                      </div>
                    ))}
                    {loadingMemberships && <div className="col-span-2 py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#daa857]" /></div>}
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Verification Method</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => method.isEnabled && updateFormData({ paymentMethod: method.id })}
                          className={cn(
                            "relative cursor-pointer rounded-xl py-4 border-2 text-center text-[10px] font-black transition-all",
                            formData.paymentMethod === method.id 
                              ? "bg-[#daa857] border-[#daa857] text-black" 
                              : "bg-background border-border text-foreground hover:border-[#daa857]/50",
                            !method.isEnabled && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {method.name}
                          {!method.isEnabled && method.errorLabel && <Badge className="absolute -top-2 -right-2 scale-75 bg-accent text-foreground">{method.errorLabel}</Badge>}
                        </div>
                      ))}
                    </div>

                          {isBankTransfer && (
                      <div className="p-4 md:p-6 rounded-2xl bg-background border border-[#daa857]/30 border-dashed">
                        <div className="flex items-center gap-3 text-[#daa857] mb-2">
                           <AlertTriangle className="h-5 w-5" />
                           <span className="text-xs font-black">Instructions</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold whitespace-pre-line leading-relaxed">
                          {bankDetailsMessage}
                          {"\n\nConfirm identity and transfer proof via official WhatsApp after registration."}
                        </p>
                      </div>
                    )}
                 </div>
               </div>
             )}

             {/* Step 3: Goals */}
             {step === 3 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FITNESS_GOALS_OPTIONS.map((goal) => (
                      <div 
                        key={goal.id} 
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "cursor-pointer flex items-center gap-4 p-5 rounded-xl border-2 transition-all",
                          (formData.fitnessGoals as string[])?.includes(goal.id)
                            ? "bg-[#daa857]/10 border-[#daa857] text-foreground"
                            : "bg-background border-border text-muted-foreground hover:border-border"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0",
                          (formData.fitnessGoals as string[])?.includes(goal.id) ? "border-[#daa857] bg-[#daa857]" : "border-gray-700"
                        )}>
                          {(formData.fitnessGoals as string[])?.includes(goal.id) && <ShieldCheck className="h-3 w-3 text-black" />}
                        </div>
                        <span className="text-[10px] font-black">{goal.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Fitness Goals</Label>                    <Textarea 
                      placeholder="Specify your targets, existing injuries, or specialized requirements..."
                      value={formData.fitnessGoalsDetails}
                      onChange={(e) => updateFormData({ fitnessGoalsDetails: e.target.value })}
                      className="min-h-[150px] bg-background border-border rounded-2xl focus:border-[#daa857] p-4 md:p-6 font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Emergency Liaison</Label>
                      <Input 
                        placeholder="Contact Name" 
                        value={formData.emergencyContact}
                        onChange={(e) => updateFormData({ emergencyContact: e.target.value })}
                        className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Emergency Phone</Label>
                      <Input 
                        placeholder="Contact Phone" 
                        value={formData.emergencyPhone}
                        onChange={(e) => updateFormData({ emergencyPhone: e.target.value })}
                        className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold"
                      />
                    </div>
                  </div>
               </div>
             )}

             {/* Step 4: Security */}
             {step === 4 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Secure Password</Label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 Characters" 
                          value={formData.password}
                          onChange={(e) => updateFormData({ password: e.target.value })}
                          className={cn("h-16 bg-background border-border rounded-xl focus:border-[#daa857] px-6 pr-14 font-bold", fieldErrors.password && "border-red-500")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-2">Verify Password</Label>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repeat Password" 
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                          className={cn("h-16 bg-background border-border rounded-xl focus:border-[#daa857] px-6 pr-14 font-bold", fieldErrors.confirmPassword && "border-red-500")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setPaymentConfirmed(!paymentConfirmed)}
                    className={cn(
                      "p-4 md:p-8 rounded-[2rem] border-2 cursor-pointer transition-all",
                      paymentConfirmed ? "bg-[#daa857]/10 border-[#daa857]" : "bg-background border-border border-dashed"
                    )}
                  >
                    <div className="flex gap-4 md:gap-6 items-start">
                       <div className={cn(
                          "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1",
                          paymentConfirmed ? "bg-[#daa857] border-[#daa857]" : "border-gray-700"
                        )}>
                          {paymentConfirmed && <ShieldCheck className="h-4 w-4 text-black" />}
                       </div>
                       <div className="space-y-2">
                          <h3 className="font-black italic text-sm">Deployment Confirmation</h3>
                          <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                            I verify that all provided data is accurate and I acknowledge the payment policy for the selected membership tier.
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 md:p-8 rounded-[2rem] bg-card/50 border border-border space-y-4">
                     <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground">Review Application</span>
                        <Badge className="bg-[#daa857] text-black font-black italic">Pending Approval</Badge>
                     </div>
                     <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {[
                          { l: 'Elite', v: `${formData.firstName} ${formData.lastName}` },
                          { l: 'Channel', v: formData.email },
                          { l: 'Tier', v: memberships.find(m => m.id === formData.membershipId)?.name || 'None' },
                          { l: 'Method', v: formData.paymentMethod || 'None' }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                             <p className="text-[8px] font-black text-muted-foreground">{item.l}</p>
                             <p className="text-xs font-black truncate">{item.v}</p>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
             )}

             {/* Actions */}
             <div className="mt-12 flex flex-col-reverse md:flex-row gap-4">
               {step > 1 && (
                 <Button 
                   variant="outline" 
                   onClick={prevStep} 
                   disabled={isLoading}
                   className="h-16 px-8 rounded-xl border-border bg-transparent hover:bg-accent text-muted-foreground font-black"
                 >
                   Back
                 </Button>
               )}

               {step < 4 ? (
                 <Button 
                   onClick={handleNextStep}
                   className="flex-1 h-16 rounded-xl text-black font-black tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-[#daa857]/5"
                   style={{ backgroundColor: accent }}
                 >
                   Advance <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
               ) : (
                 <Button
                   disabled={isLoading || !paymentConfirmed}
                   onClick={async () => {
                      if (!validateStep(4)) return
                      setIsSubmitting(true)
                      try {
                        const res = await fetch('/api/auth/signup', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...formData, birthday: formData.birthday }),
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.error || 'Failed to submit application')
                        
                        if (data.authorization_url) {
                          toast({ title: 'Redirecting to Paystack...', description: 'Please complete your payment securely.', duration: 5000 })
                          window.location.href = data.authorization_url
                          return
                        }

                        toast({ title: 'Application Transmitted', description: 'Redirecting to secure login...', duration: 5000 })
                        setTimeout(() => window.location.href = '/login', 3000)
                      } catch (err: any) {
                        toast({ title: 'Application Error', description: err.message, variant: 'destructive' })
                        setIsSubmitting(false)
                      }
                   }}
                   className="flex-1 h-16 rounded-xl text-black font-black tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-[#daa857]/5"
                   style={{ backgroundColor: accent }}
                 >
                   {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Complete Application'}
                 </Button>
               )}
             </div>

           </div>
        </div>

        {/* Existing Member */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground font-medium tracking-tight">
            Already authenticated?{' '}
            <Link href="/login" className="font-black text-[#daa857] hover:underline ml-1">
              Login
            </Link>
          </p>
        </div>

        <p className="mt-12 text-center text-[10px] text-muted-foreground font-black tracking-[0.5em]">
          Klimarx Space Sanctuary © 2026
        </p>
      </div>

      <Dialog open={isCropperModalOpen} onOpenChange={setIsCropperModalOpen}>
        <DialogContent className="bg-card border-border text-foreground rounded-[1.5rem] md:rounded-[2.5rem] p-0 overflow-hidden w-[95vw] md:max-w-2xl shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Adjust Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="p-5 md:p-8 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857]">
                <CropIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">Adjust <span className="text-[#daa857]">Profile Picture</span></h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsCropperModalOpen(false)} className="rounded-full hover:bg-accent">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative h-[300px] md:h-[400px] w-full bg-background">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            )}
          </div>

          <div className="p-5 md:p-8 space-y-6 md:space-y-8 bg-card">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground">Image Zoom</Label>
                <span className="text-[10px] font-black text-[#daa857]">{Math.round(zoom * 100)}%</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="py-4"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCropperModalOpen(false)}
                className="h-12 md:h-14 px-8 border-border hover:bg-accent rounded-xl text-[10px] font-black text-muted-foreground"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCropConfirm}
                className="flex-1 h-12 md:h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
              >
                Save Profile Picture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
