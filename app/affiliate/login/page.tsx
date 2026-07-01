'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AffiliateLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/affiliate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/affiliate/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-black font-sans flex flex-col">
      <nav className="fixed top-0 w-full z-[100] bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 h-16 md:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black uppercase tracking-tighter">
              Gympilot<span className="text-orange-500">pro</span> <span className="text-xs font-normal text-muted-foreground ml-1">AFFILIATE</span>
            </span>
          </Link>
          <Link
            href="/affiliate/signup"
            className="text-[11px] font-black tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            AFFILIATE SIGNUP
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-28">
        <div className="w-full max-w-md bg-card border border-border p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-orange-500/5 opacity-10 pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <span className="text-orange-500 font-black tracking-[0.2em] text-xs mb-3 block uppercase italic">
              // Partner Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4 text-foreground italic">
              Affiliate <span className="text-orange-500">Login</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm">
              Log in to manage your referrals and track your commissions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-sm font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-orange-500">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                className="w-full bg-background border-2 border-border p-4 font-bold focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-orange-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-background border-2 border-border p-4 font-bold focus:border-orange-500 outline-none transition-colors text-foreground"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-lg rounded-none disabled:opacity-70 flex items-center justify-center transition-all active:scale-95 shadow-[0_10px_20px_rgba(249,115,22,0.2)] group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Sign In{" "}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
