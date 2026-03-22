'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Camera, Video, Image as ImageIcon } from 'lucide-react'

export function GymSettingsForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  
  const [gymData, setGymData] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState('Free')

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    heroTitle: '',
    heroSubtitle: '',
    primaryColor: '#daa857',
    secondaryColor: '#000000',
    paystackPublicKey: '',
    paystackSecretKey: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  })

  useEffect(() => {
    fetchGymData()
  }, [])

  const fetchGymData = async () => {
    try {
      const res = await fetch('/api/admin/gym')
      if (res.ok) {
        const data = await res.json()
        setGymData(data.gym)
        setCurrentPlan(data.currentPlan)
        setForm({
          name: data.gym.name || '',
          tagline: data.gym.tagline || '',
          heroTitle: data.gym.heroTitle || '',
          heroSubtitle: data.gym.heroSubtitle || '',
          primaryColor: data.gym.primaryColor || '#daa857',
          secondaryColor: data.gym.secondaryColor || '#000000',
          paystackPublicKey: data.gym.paystackPublicKey || '',
          paystackSecretKey: data.gym.paystackSecretKey || '',
          bankName: data.gym.bankName || '',
          accountNumber: data.gym.accountNumber || '',
          accountName: data.gym.accountName || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch gym', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/gym', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to update settings')
      toast({ title: 'Success', description: 'Gym branding updated successfully' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField(fieldName)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', fieldName)

    try {
      const res = await fetch('/api/admin/gym/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      
      setGymData({ ...gymData, [fieldName]: data.url })
      toast({ title: 'Success', description: 'Asset uploaded successfully' })
    } catch (error: any) {
      toast({ title: 'Upload Error', description: error.message, variant: 'destructive' })
    } finally {
      setUploadingField(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
  }

  return (
    <Card className="bg-card border-border shadow-2xl rounded-[2rem] overflow-hidden relative">
      <CardHeader className="bg-card/50 border-b border-border p-8">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Gym Branding</CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Customize your gym's look and feel</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="bg-[#daa857]/10 text-[#daa857] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-[#daa857]/20">
              Current Plan: {currentPlan.toUpperCase()}
            </div>
            <Button 
              onClick={() => window.location.href = '/admin/billing'}
              className="h-10 px-6 bg-accent hover:bg-accent text-foreground hover:text-foreground focus:text-foreground font-black uppercase tracking-widest rounded-xl text-[10px] border border-border transition-all shadow-lg hover:shadow-xl"
            >
              Upgrade or Renew Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-10">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Gym Name</Label>
              <Input 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="h-14 bg-background border-border rounded-xl text-xs font-bold uppercase tracking-widest"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tagline</Label>
              <Input 
                value={form.tagline}
                onChange={e => setForm({...form, tagline: e.target.value})}
                className="h-14 bg-background border-border rounded-xl text-xs font-bold uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hero Title</Label>
              <Input 
                value={form.heroTitle}
                onChange={e => setForm({...form, heroTitle: e.target.value})}
                className="h-14 bg-background border-border rounded-xl text-xs font-bold uppercase tracking-widest"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hero Subtitle</Label>
              <Input 
                value={form.heroSubtitle}
                onChange={e => setForm({...form, heroSubtitle: e.target.value})}
                className="h-14 bg-background border-border rounded-xl text-xs font-bold uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Primary Color</Label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color"
                  value={form.primaryColor}
                  onChange={e => setForm({...form, primaryColor: e.target.value})}
                  className="h-14 w-14 rounded-xl cursor-pointer bg-background border border-border"
                />
                <Input 
                  value={form.primaryColor}
                  onChange={e => setForm({...form, primaryColor: e.target.value})}
                  className="flex-1 h-14 bg-background border-border rounded-xl font-mono text-sm uppercase"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Secondary Color</Label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color"
                  value={form.secondaryColor}
                  onChange={e => setForm({...form, secondaryColor: e.target.value})}
                  className="h-14 w-14 rounded-xl cursor-pointer bg-background border border-border"
                />
                <Input 
                  value={form.secondaryColor}
                  onChange={e => setForm({...form, secondaryColor: e.target.value})}
                  className="flex-1 h-14 bg-background border-border rounded-xl font-mono text-sm uppercase"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl">
            {saving ? <Loader2 className="animate-spin mr-2" /> : 'Save Text & Colors'}
          </Button>
        </form>

        <hr className="border-border" />

        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase italic tracking-widest text-foreground">Payment Integration (Paystack)</h3>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Connect your Paystack account to receive payments directly.</p>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Paystack Public Key</Label>
                <Input 
                  value={form.paystackPublicKey}
                  onChange={e => setForm({...form, paystackPublicKey: e.target.value})}
                  type="password"
                  placeholder="pk_test_..."
                  className="h-14 bg-background border-border rounded-xl text-xs font-bold tracking-widest"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Paystack Secret Key</Label>
                <Input 
                  value={form.paystackSecretKey}
                  onChange={e => setForm({...form, paystackSecretKey: e.target.value})}
                  type="password"
                  placeholder="sk_test_..."
                  className="h-14 bg-background border-border rounded-xl text-xs font-bold tracking-widest"
                />
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-xl space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-orange-500">Required Webhook Configuration</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Copy these URLs into your Paystack Dashboard (Settings &gt; API Keys & Webhooks):</p>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Callback URL</Label>
                  <code className="block mt-1 p-3 bg-background border border-border rounded-lg text-xs font-mono text-muted-foreground select-all">
                    https://{gymData?.slug}.gympilotpro.com/payment/success
                  </code>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Webhook URL</Label>
                  <code className="block mt-1 p-3 bg-background border border-border rounded-lg text-xs font-mono text-muted-foreground select-all">
                    https://{gymData?.slug}.gympilotpro.com/api/webhooks/paystack/{gymData?.id}
                  </code>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full h-14 bg-accent hover:bg-accent text-foreground font-black uppercase tracking-widest rounded-xl border border-border">
              {saving ? <Loader2 className="animate-spin mr-2" /> : 'Save API Keys'}
            </Button>
          </form>
        </div>

        <hr className="border-border" />

        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase italic tracking-widest text-foreground">Bank Transfer Configuration</h3>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Provide your gym's bank details for manual member renewals and signups.</p>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bank Name</Label>
                <Input 
                  value={form.bankName}
                  onChange={e => setForm({...form, bankName: e.target.value})}
                  placeholder="e.g. GTBank, Zenith, FCMB"
                  className="h-14 bg-background border-border rounded-xl text-xs font-bold uppercase tracking-widest"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Account Number</Label>
                <Input 
                  value={form.accountNumber}
                  onChange={e => setForm({...form, accountNumber: e.target.value})}
                  placeholder="0000000000"
                  className="h-14 bg-background border-border rounded-xl text-xs font-bold tracking-widest"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Account Name</Label>
                <Input 
                  value={form.accountName}
                  onChange={e => setForm({...form, accountName: e.target.value})}
                  placeholder="Legal Gym Name"
                  className="h-14 bg-background border-border rounded-xl text-xs font-bold uppercase tracking-widest"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full h-14 bg-accent hover:bg-accent text-foreground font-black uppercase tracking-widest rounded-xl border border-border">
              {saving ? <Loader2 className="animate-spin mr-2" /> : 'Save Bank Details'}
            </Button>
          </form>
        </div>

        <hr className="border-border" />
          
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase italic tracking-widest text-foreground">Media Assets</h3>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Upload your gym's visual identity assets.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Logo Upload */}
            <div className="p-4 bg-background border border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-20 w-20 rounded-full border border-border overflow-hidden flex items-center justify-center bg-card">
                {gymData?.logo ? <img src={gymData.logo} alt="Logo" className="w-full h-full object-contain p-2" /> : <Camera className="text-muted-foreground" />}
              </div>
              <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#daa857]">
                {uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}
                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} disabled={!!uploadingField} />
              </Label>
            </div>

            {/* Favicon Upload */}
            <div className="p-4 bg-background border border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-20 w-20 rounded-xl border border-border overflow-hidden flex items-center justify-center bg-card">
                {gymData?.favicon ? <img src={gymData.favicon} alt="Favicon" className="w-full h-full object-contain p-4" /> : <ImageIcon className="text-muted-foreground" />}
              </div>
              <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#daa857]">
                {uploadingField === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
                <input type="file" className="hidden" accept="image/x-icon,image/png,image/jpeg" onChange={e => handleFileUpload(e, 'favicon')} disabled={!!uploadingField} />
              </Label>
            </div>

            {/* Hero Video Upload */}
            <div className="p-4 bg-background border border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-20 w-20 rounded-xl border border-border overflow-hidden flex items-center justify-center bg-card">
                {gymData?.heroVideo ? <Video className="text-[#daa857]" /> : <Video className="text-muted-foreground" />}
              </div>
              <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#daa857]">
                {uploadingField === 'heroVideo' ? 'Uploading...' : 'Upload Hero Video'}
                <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, 'heroVideo')} disabled={!!uploadingField} />
              </Label>
            </div>

            {/* Showcase 1 Upload */}
            <div className="p-4 bg-background border border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-20 w-20 rounded-xl border border-border overflow-hidden flex items-center justify-center bg-card">
                {gymData?.showcaseImage1 ? <img src={gymData.showcaseImage1} alt="S1" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" />}
              </div>
              <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#daa857]">
                {uploadingField === 'showcaseImage1' ? 'Uploading...' : 'Upload Showcase 1'}
                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'showcaseImage1')} disabled={!!uploadingField} />
              </Label>
            </div>

            {/* Showcase 2 Upload */}
            <div className="p-4 bg-background border border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-20 w-20 rounded-xl border border-border overflow-hidden flex items-center justify-center bg-card">
                {gymData?.showcaseImage2 ? <img src={gymData.showcaseImage2} alt="S2" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" />}
              </div>
              <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#daa857]">
                {uploadingField === 'showcaseImage2' ? 'Uploading...' : 'Upload Showcase 2'}
                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'showcaseImage2')} disabled={!!uploadingField} />
              </Label>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}
