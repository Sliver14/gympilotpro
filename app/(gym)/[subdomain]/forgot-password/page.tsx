'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Mail, Loader2, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const accent = '#daa857'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter your recovery email.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setError(null)
        toast({
          title: 'Email Sent',
          description: data.message,
        })
      } else {
        const errorMessage = data.error || 'Something went wrong'
        setError(errorMessage)
        throw new Error(errorMessage)
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-foreground selection:bg-[#daa857]/30 px-4">
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold mt-1">Account Recovery</p>
          </div>
        </Link>

        {/* Content Container */}
        <div className="p-8 bg-card border border-[#daa857]/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Decor */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/10 blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />

          <div className="relative z-10">
            <div className="mb-2">
              <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-[#daa857] transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back to Login
              </Link>
            </div>

            {isSubmitted ? (
              <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto border-2 border-[#daa857]/20 bg-background shadow-xl shadow-[#daa857]/5">
                  <Mail className="h-10 w-10 text-[#daa857]" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Check Your <span style={{ color: accent }}>Inbox</span></h2>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                    We've sent a recovery link to <span className="text-foreground font-bold">{email}</span>. 
                    Follow the link to reset your account access.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full h-14 border-border bg-transparent hover:bg-accent rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mt-4" 
                  onClick={() => setIsSubmitted(false)}
                >
                  Resend Link
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Lost Your <span style={{ color: accent }}>Password?</span></h2>
                  <p className="text-muted-foreground text-sm mt-3 font-medium">Enter your registered email to receive a recovery link.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest leading-tight">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors group-focus-within:text-[#daa857]" style={{ color: `${accent}66` }} />
                      <Input
                        type="email"
                        placeholder="Recovery Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-16 pl-14 bg-background border-border rounded-2xl focus:border-[#daa857] focus:ring-0 transition-all placeholder:text-muted-foreground font-medium"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-16 text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-xl shadow-[#daa857]/10" 
                    style={{ backgroundColor: accent }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Recovery Link <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.5em]">
          Klimarx Space © 2026 • Security Active
        </p>
      </div>
    </div>
  )
}
