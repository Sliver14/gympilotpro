'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGym } from '@/components/gym-provider'
import { Globe, ShieldCheck, AlertTriangle, Loader2, ArrowRight } from 'lucide-react'

export default function DomainDashboard() {
  const { gymData, isLoading } = useGym()
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (gymData?.customDomain) {
      setDomain(gymData.customDomain)
    }
  }, [gymData])

  if (isLoading || !gymData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
      // Refresh page to show updated status
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setVerifying(false)
    }
  }

  const isConnected = gymData.domainVerified && gymData.customDomain
  const accent = gymData.primaryColor || '#daa857'

  return (
    <div className="flex-1 p-8 bg-[#0a0a0a] text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Domain Settings</h1>
          <p className="text-gray-400 font-medium">Connect your custom domain to your GymPilotPro dashboard and landing page.</p>
        </div>

        {/* Current Status */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-4">Current Status</h2>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3 text-green-500 font-bold uppercase p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex-1">
                <ShieldCheck size={24} />
                <div>
                  <p className="text-white text-sm">Connected Domain</p>
                  <a href={`https://${gymData.customDomain}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-green-500">{gymData.customDomain}</a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-orange-500 font-bold uppercase p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex-1">
                <AlertTriangle size={24} />
                <div>
                  <p className="text-white text-sm">Not Connected</p>
                  <p className="text-orange-500/80 text-xs">You are currently using {gymData.slug}.gympilotpro.com</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Instructions */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-black italic uppercase">1. Configure Your DNS</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Log in to your domain registrar (GoDaddy, Namecheap, etc.) and add the following records to your DNS settings.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-black border border-white/10 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Option A: CNAME Record (Recommended)</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-gray-400">Name</span>
                  <span className="text-gray-400">Target / Value</span>
                  
                  <span className="font-bold text-white">CNAME</span>
                  <span className="font-bold text-white">www</span>
                  <span className="font-mono text-orange-500 text-xs">cname.vercel-dns.com</span>
                </div>
              </div>

              <div className="p-4 bg-black border border-white/10 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Option B: A Record (Root Domain)</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-gray-400">Name</span>
                  <span className="text-gray-400">Value</span>
                  
                  <span className="font-bold text-white">A</span>
                  <span className="font-bold text-white">@</span>
                  <span className="font-mono text-orange-500 text-xs">76.76.21.21</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-black italic uppercase">2. Verify Domain</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              After adding the DNS records, enter your domain below and click verify. Note: DNS propagation can take up to 24 hours.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Custom Domain</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <Input 
                    placeholder="www.yourgym.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="pl-10 bg-black border-white/10 h-12 text-white font-mono placeholder:text-gray-700 focus:border-orange-500"
                    disabled={verifying}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold uppercase rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold uppercase rounded-lg">
                  {success}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={verifying || !domain}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-black italic uppercase tracking-widest rounded-lg transition-transform active:scale-[0.98]"
              >
                {verifying ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Verify Connection'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
