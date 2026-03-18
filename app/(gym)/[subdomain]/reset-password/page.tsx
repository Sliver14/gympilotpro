'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, AlertCircle, Lock, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { toast } = useToast()

  const accent = '#daa857'

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing recovery token.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: 'Success',
          description: 'Your vault key has been reset successfully.',
        })
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        throw new Error(data.error || 'Failed to reset password')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-8 bg-[#111] border border-red-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/5 blur-[80px]" />
        <div className="relative z-10 space-y-6">
          <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/20 bg-black">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Invalid <span className="text-red-500">Link</span></h2>
            <p className="text-gray-500 text-sm font-medium">{error}</p>
          </div>
          <Link href="/forgot-password">
            <Button className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-[#111] border border-[#daa857]/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/10 blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />

      <div className="relative z-10">
        {isSuccess ? (
          <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/20 bg-black shadow-xl shadow-green-500/5">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Reset <span className="text-green-500">Success</span></h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Your vault key has been updated. Redirecting to login terminal...
              </p>
            </div>
            <Link href="/login">
              <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl mt-4">
                Login Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Reset <span style={{ color: accent }}>Key</span></h2>
              <p className="text-gray-500 text-sm mt-3 font-medium">Define your new secure entry credentials.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors group-focus-within:text-[#daa857]" style={{ color: `${accent}66` }} />
                  <Input
                    type="password"
                    placeholder="New Vault Key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-16 pl-14 bg-black border-white/5 rounded-2xl focus:border-[#daa857] focus:ring-0 transition-all placeholder:text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors group-focus-within:text-[#daa857]" style={{ color: `${accent}66` }} />
                  <Input
                    type="password"
                    placeholder="Confirm New Key"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-16 pl-14 bg-black border-white/5 rounded-2xl focus:border-[#daa857] focus:ring-0 transition-all placeholder:text-gray-700 font-medium"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group mt-4 shadow-xl shadow-[#daa857]/10" 
                style={{ backgroundColor: accent }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Update Vault Key <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const accent = '#daa857'
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white selection:bg-[#daa857]/30 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-12 flex flex-col items-center justify-center gap-4 group">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 transition-transform group-hover:scale-110" style={{ borderColor: `${accent}80` }}>
            <Image 
              src="/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png" 
              alt="Klimarx Space Logo" 
              fill
              className="object-contain p-2 bg-white"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Klimarx<span style={{ color: accent }}>Space</span></h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mt-1">Security Terminal</p>
          </div>
        </Link>

        <Suspense fallback={
          <div className="p-12 flex justify-center bg-[#111] border border-white/5 rounded-[2.5rem]">
            <Loader2 className="h-10 w-10 animate-spin text-[#daa857]" />
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>

        {/* Footer info */}
        <p className="mt-12 text-center text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">
          Klimarx Space © 2026 • Security Active
        </p>
      </div>
    </div>
  )
}
