'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useGym } from '@/components/gym-provider'

export default function LoginPage() {
  const { gymData, isLoading: gymLoading } = useGym()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const router = useRouter()
  const { toast } = useToast()

  const accent = gymData?.primaryColor || '#daa857'
  const logoUrl = gymData?.logo
  const gymName = gymData?.name || 'Klimarx Space'
  const gymInitials = gymName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const tagline = gymData?.heroSubtitle || 'Elite Performance Sanctuary'

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}
    let isValid = true

    if (!email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (!password) {
      errors.password = 'Password is required'
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!validateForm()) {
      const errorMessage = 'Please fix the errors below'
      setError(errorMessage)
      toast({
        title: 'Validation Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Login failed. Please check your credentials.'
        setError(errorMessage)
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      toast({
        title: 'Success',
        description: 'Welcome back!',
      })

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (data.user.role === 'secretary') {
        router.push('/secretary/dashboard')
      } else if (data.user.role === 'trainer') {
        router.push('/trainer/dashboard')
      } else {
        router.push('/member/dashboard')
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection and try again.'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  if (gymLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#daa857]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4 py-20">
      <style jsx global>{`
        ::selection {
          background-color: ${accent}4d;
        }
      `}</style>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-12 flex flex-col items-center justify-center gap-4 group">
          <div className="relative h-16 md:h-20 w-20 overflow-hidden rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110" style={{ borderColor: `${accent}80`, backgroundColor: logoUrl  ? 'white' : 'hsl(var(--card))' }}>
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt={`${gymName} Logo`} 
                fill
                className="object-contain p-2"
              />
            ) : (
              <span className="font-black italic text-2xl" style={{ color: accent }}>{gymInitials}</span>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
              {gymName.split(' ')[0]}<span style={{ color: accent }}>{gymName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground font-bold mt-1">{tagline}</p>
          </div>
        </Link>

        {/* Login Form Container */}
        <div className="p-4 md:p-8 bg-card border rounded-[2.5rem] shadow-2xl relative overflow-hidden" style={{ borderColor: `${accent}33` }}>
          {/* Subtle Glow Decor */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-[80px]" style={{ backgroundColor: `${accent}1a` }} />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-[80px]" style={{ backgroundColor: `${accent}0d` }} />

          <div className="relative z-10">
            <div className="mb-10">
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">Welcome <span style={{ color: accent }}>Back</span></h2>
              <p className="text-muted-foreground text-sm mt-3 font-medium">Enter your credentials to access the space.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-xs font-bold text-red-500 leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors group-focus-within:text-foreground" style={{ color: fieldErrors.email ? '#ef4444' : `${accent}66` }} />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                      if (error) setError(null)
                    }}
                    disabled={isLoading}
                    className={cn(
                      "h-16 pl-14 bg-background border-border rounded-2xl focus:ring-0 transition-all placeholder:text-muted-foreground font-medium",
                      fieldErrors.email && "border-red-500/50 focus:border-red-500"
                    )}
                    style={{ borderColor: fieldErrors.email ? undefined : `${accent}1a` }}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[10px] text-red-500 font-bold ml-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors group-focus-within:text-foreground" style={{ color: fieldErrors.password ? '#ef4444' : `${accent}66` }} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
                      if (error) setError(null)
                    }}
                    disabled={isLoading}
                    className={cn(
                      "h-16 pl-14 pr-14 bg-background border-border rounded-2xl focus:ring-0 transition-all placeholder:text-muted-foreground font-medium",
                      fieldErrors.password && "border-red-500/50 focus:border-red-500"
                    )}
                    style={{ borderColor: fieldErrors.password ? undefined : `${accent}1a` }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[10px] text-red-500 font-bold ml-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end pr-2">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors font-bold"
                  style={{ color: `${accent}cc` }}
                >
                  Forgot Password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 text-black font-black tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group mt-4 shadow-xl shadow-black/20" 
                style={{ backgroundColor: accent, color: gymData?.secondaryColor || '#000000' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                New to the space?{' '}
                <Link href="/signup" className="font-black hover:underline ml-1" style={{ color: accent }}>
                  Apply for Membership
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-center text-[10px] text-muted-foreground font-black tracking-[0.5em]">
          {gymName} © 2026 • Security Active
        </p>
      </div>
    </div>
  )
}
