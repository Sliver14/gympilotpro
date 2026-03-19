'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGym } from '@/components/gym-provider'
import { Globe, ShieldCheck, AlertTriangle, Loader2, ArrowRight, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingConfig {
  type: string
  name: string
  value: string
}

export default function DomainDashboard() {
  const { gymData, isLoading } = useGym()
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingConfig, setPendingConfig] = useState<PendingConfig | null>(null)
  const [copied, setCopied] = useState(false)

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
    setPendingConfig(null)

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

      if (data.requiresAction) {
        setPendingConfig(data.recommendedConfig)
        setError('DNS configuration incomplete. Please add the record below to your domain registrar.')
      } else {
        setSuccess('Domain successfully verified and connected!')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isConnected = gymData.domainVerified && gymData.customDomain
  const accent = gymData.primaryColor || '#daa857'

  return (
    <div className="flex-1 p-8 bg-[#0a0a0a] text-white min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Domain Settings</h1>
            <p className="text-gray-400 font-medium uppercase text-[10px] tracking-widest leading-relaxed">Connect your custom brand identity to your dashboard.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
             <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-orange-500")} />
             <span className="text-[10px] font-black uppercase tracking-widest">{isConnected ? "Verified" : "Pending Setup"}</span>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="p-8 bg-[#111] border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />
          
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 relative z-10">Live Configuration</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            {isConnected ? (
              <div className="flex items-center gap-6 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl flex-1 group">
                <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-xl">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Active Destination</p>
                  <a href={`https://${gymData.customDomain}`} target="_blank" rel="noopener noreferrer" className="text-xl font-black italic uppercase text-white hover:text-green-500 transition-colors flex items-center gap-2">
                    {gymData.customDomain} <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6 p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex-1">
                <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Current Access Point</p>
                  <p className="text-xl font-black italic uppercase text-white">{gymData.slug}.gympilotpro.com</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="p-8 bg-[#111] border border-white/5 rounded-[2rem] h-full">
              <h2 className="text-xl font-black italic uppercase mb-6 tracking-tighter">1. Connect Your Domain</h2>
              
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-3 ml-1">Domain URL</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-orange-500 transition-colors" size={20} />
                    <Input 
                      placeholder="www.yourgym.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="h-16 pl-12 bg-black border-white/5 rounded-xl text-lg font-black italic uppercase focus:border-orange-500 transition-all"
                      disabled={verifying}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase rounded-xl flex items-center gap-3">
                    <AlertTriangle size={18} /> {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase rounded-xl flex items-center gap-3">
                    <ShieldCheck size={18} /> {success}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={verifying || !domain}
                  className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-black font-black italic uppercase text-lg tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-xl shadow-orange-500/10"
                >
                  {verifying ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="animate-spin h-6 w-6" /> Running Checks...
                    </span>
                  ) : 'Verify & Link Domain'}
                </Button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="p-8 bg-black border border-white/5 rounded-[2rem] h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black italic uppercase mb-6 tracking-tighter">2. DNS Requirements</h2>
                <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-tight mb-8">
                  Point your domain to our global infrastructure using these records.
                </p>
                
                <div className="space-y-4">
                  {pendingConfig ? (
                    <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-orange-500 text-black text-[10px] font-black uppercase italic rounded-md">Required Record</span>
                        <button onClick={() => copyToClipboard(pendingConfig.value)} className="text-orange-500 hover:text-orange-400 transition-colors">
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-600">Type</span>
                          <span className="text-[10px] font-black uppercase text-white">{pendingConfig.type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-600">Name</span>
                          <span className="text-[10px] font-black uppercase text-white">{pendingConfig.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-600">Value</span>
                          <span className="text-[10px] font-black uppercase text-orange-500 truncate">{pendingConfig.value}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-black uppercase text-gray-500 italic">Type A (Root)</span>
                          <span className="text-[10px] font-black text-white">216.198.79.1</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-black uppercase text-gray-500 italic">CNAME (Sub)</span>
                          <span className="text-[10px] font-black text-white italic">25f84edf9647823c.vercel-dns-017.com</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                  Propagation can take up to 24 hours. SSL certificates will be generated automatically once verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
