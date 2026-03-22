'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGym } from '@/components/gym-provider'
import { Globe, ShieldCheck, AlertTriangle, Loader2, ArrowRight, Copy, Check, Lock, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasPremiumAccess } from '@/lib/plans'

export default function DomainDashboard() {
  const { gymData, isLoading } = useGym()
  const router = useRouter()

  const [domain, setDomain] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (gymData?.customDomain) {
      setDomain(gymData.customDomain)
    }
  }, [gymData])

  if (isLoading || !gymData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const currentPlan = gymData.subscriptions?.[0]?.plan || 'starter'
  if (!hasPremiumAccess(currentPlan, 'pro')) {
    return (
      <div className="flex-1 p-8 bg-background text-foreground min-h-screen font-sans flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-[2rem] border border-border shadow-2xl">
          <div className="h-20 w-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto border border-orange-500/20 text-orange-500">
            <Lock size={32} />
          </div>
          <div className="flex flex-col items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4 text-muted-foreground hover:text-foreground focus:text-foreground uppercase text-[10px] font-black tracking-widest gap-2"
            >
              <ChevronLeft size={14} /> Back
            </Button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Premium Feature</h2>
            <p className="text-muted-foreground font-medium text-xs tracking-widest uppercase leading-relaxed text-center">
              Custom Domain Setup is available on <span className="text-orange-500 font-black">Pro</span> and <span className="text-orange-500 font-black">Elite</span> plans. Upgrade your gym to connect your own brand identity.
            </p>
          </div>
          <Button 
            className="w-full h-14 bg-orange-500 text-black hover:text-black focus:text-black font-black uppercase tracking-widest rounded-xl"
            onClick={() => router.push('/admin/billing')}
          >
            Upgrade Plan
          </Button>
        </div>
      </div>
    )
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain) return

    setVerifying(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId: gymData.id,
          domain: domain,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setSuccess('Domain successfully verified and connected!')

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)

    setTimeout(() => setCopied(null), 2000)
  }

  const isConnected = gymData.domainVerified && gymData.customDomain

  return (
    <div className="flex-1 p-8 bg-background text-foreground min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground uppercase text-[10px] font-black tracking-widest gap-2 p-0 h-auto"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </Button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
              Domain Settings
            </h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
              Connect your custom brand identity to your dashboard.
            </p>
          </div>

          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-accent border border-border rounded-full">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Verified
              </span>
            </div>
          )}
        </div>

        {/* STATUS CARD */}
        <div className="p-8 bg-card border border-border rounded-[2rem] shadow-2xl relative overflow-hidden">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Live Configuration
          </h2>

          {isConnected ? (
            <div className="flex items-center gap-6 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
              <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Active Destination
                </p>
                <a
                  href={`https://${gymData.customDomain}`}
                  target="_blank"
                  className="text-xl font-black italic uppercase hover:text-green-500"
                >
                  {gymData.customDomain}
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
              <AlertTriangle size={28} className="text-orange-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Current Access Point
                </p>
                <p className="text-xl font-black italic uppercase">
                  {gymData.slug}.gympilotpro.com
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-5 gap-8">

          {/* FORM */}
          <div className="md:col-span-3">
            <div className="p-8 bg-card border border-border rounded-[2rem]">
              <h2 className="text-xl font-black italic uppercase mb-6">
                1. Connect Your Domain
              </h2>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="www.yourgym.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="h-16 pl-12 bg-background border-border text-lg font-black italic uppercase"
                  />
                </div>

                {error && <p className="text-red-500 text-xs">{error}</p>}
                {success && <p className="text-green-500 text-xs">{success}</p>}

                <Button className="w-full h-16 bg-orange-500 font-black uppercase">
                  {verifying ? 'Verifying...' : 'Verify & Link Domain'}
                </Button>
              </form>
            </div>
          </div>

          {/* DNS SECTION */}
          <div className="md:col-span-2">
            <div className="p-8 bg-background border border-border rounded-[2rem]">

              <h2 className="text-xl font-black italic uppercase mb-4">
                2. DNS Setup
              </h2>

              <p className="text-muted-foreground text-xs mb-6 uppercase">
                Add BOTH records below in your domain provider.
              </p>

              <div className="space-y-6">

                {/* A RECORD */}
                <div className="p-5 bg-accent border rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-xs">A Record</span>
                    <button onClick={() => copyToClipboard('A @ 76.76.21.21', 'a')}>
                      {copied === 'a' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-sm mt-2">A @ 76.76.21.21</p>
                </div>

                {/* CNAME */}
                <div className="p-5 bg-accent border rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-xs">CNAME</span>
                    <button onClick={() => copyToClipboard('CNAME www cname.vercel-dns.com', 'cname')}>
                      {copied === 'cname' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-sm mt-2">CNAME www cname.vercel-dns.com</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}