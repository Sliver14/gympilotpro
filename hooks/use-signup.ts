import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './use-toast'

// --- 1. CORRECTED AND EXPANDED INTERFACE ---
export interface SignupFormData {
  // Step 1
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  profileImage: string
  birthday?: string
  gender: string
  hearAboutUs?: string

  // Step 2
  membershipId: string
  paymentMethod: string

  // Step 3
  fitnessGoals: string[] // Correctly typed as a string array
  fitnessGoalsDetails?: string
  emergencyContact?: string
  emergencyPhone?: string

  // Step 4
  password: string
  confirmPassword: string
}

export function useSignup() {
  const [step, setStep] = useState(1)
  // --- 2. INITIALIZED STATE CORRECTLY ---
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profileImage: '',
    birthday: '',
    gender: '',
    hearAboutUs: '',
    membershipId: '',
    paymentMethod: '',
    fitnessGoals: [], // Initialized as an empty array
    fitnessGoalsDetails: '',
    emergencyContact: '',
    emergencyPhone: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const submitSignup = async () => {
    // --- 3. CENTRALIZED AND IMPROVED VALIDATION ---
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.gender || !formData.profileImage) {
      toast({ title: 'Error', description: 'Please fill in all personal information (Step 1)', variant: 'destructive' })
      setStep(1)
      return
    }
    if (!formData.membershipId || !formData.paymentMethod) {
      toast({ title: 'Error', description: 'Please select a membership and payment method (Step 2)', variant: 'destructive' })
      setStep(2)
      return
    }
    if (formData.fitnessGoals.length === 0 && !formData.fitnessGoalsDetails) {
      toast({ title: 'Error', description: 'Please select or describe your fitness goals (Step 3)', variant: 'destructive' })
      setStep(3)
      return
    }
    if (!formData.password || !formData.confirmPassword) {
      toast({ title: 'Error', description: 'Please enter and confirm your password (Step 4)', variant: 'destructive' })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (formData.password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters long', variant: 'destructive' })
      return
    }

    setIsLoading(true)

    try {
      // --- 4. SENDING COMPLETE AND CORRECT PAYLOAD ---
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Step 1
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          profileImage: formData.profileImage,
          birthday: formData.birthday,
          gender: formData.gender,
          hearAboutUs: formData.hearAboutUs,

          // Step 2
          membershipId: formData.membershipId,
          paymentMethod: formData.paymentMethod,

          // Step 3
          fitnessGoals: formData.fitnessGoals, // Sent as an array
          fitnessGoalsDetails: formData.fitnessGoalsDetails,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,

          // Step 4
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Display backend error message directly
        toast({
          title: 'Signup Failed',
          description: data.error || 'An unknown error occurred. Please try again.',
          variant: 'destructive',
        })
        setIsLoading(false) // Stop loading on failure
        return
      }

      // --- NEW: Handle conditional success response ---
      if (data.bankInstructions) {
        toast({
          title: 'Account Created! Action Required.',
          // Using a component or custom renderer for the toast is better for formatting
          description: 'Please follow bank transfer instructions to complete your registration. You will be redirected shortly.',
          duration: 15000, // 15 seconds
        })
        // In a real app, you might set state here to show a modal with the instructions
        // For now, we'll log them to the console for the developer.
        console.log("Bank Transfer Instructions:\n", data.bankInstructions);
      } else {
        toast({
          title: 'Account Created!',
          description: 'Your registration is pending payment verification by our staff.',
          duration: 10000, // 10 seconds
        })
      }

      // Redirect to login page after a delay so user can read the toast
      setTimeout(() => {
        router.push('/login')
      }, 5000);

    } catch (error) {
      console.error('Submit signup error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected network error occurred. Please check your connection.',
        variant: 'destructive',
      })
    } finally {
      // We don't set isLoading to false here because we are navigating away
    }
  }

  return {
    step,
    formData,
    isLoading,
    updateFormData,
    nextStep,
    prevStep,
    submitSignup,
  }
}
