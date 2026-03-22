'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  Loader2, 
  Camera, 
  Video, 
  Image as ImageIcon,
  Palette,
  CreditCard,
  Building2,
  ImagePlus,
  ChevronRight,
  Copy
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function GymSettingsForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  
  const [gymData, setGymData] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState('Free')

  // Modal states
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)

  // Loading states
  const [savingBranding, setSavingBranding] = useState(false)
  const [savingPayments, setSavingPayments] = useState(false)
  const [savingBank, setSavingBank] = useState(false)

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

  const handleSave = async (e: React.FormEvent, setSaving: (state: boolean) => void, closeModal: () => void) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/gym', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to update settings')
      toast({ title: 'Success', description: 'Gym settings updated successfully' })
      closeModal()
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

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied', description: `${type} copied to clipboard.` })
  }

  if (loading) {
    return <div className="flex justify-center p-5 md:p-10"><Loader2 className="animate-spin text-[#daa857]" /></div>
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="bg-card border border-border rounded-[2.5rem] p-4 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#daa857]/5 blur-[100px]" />
        
        <div className="relative z-10 flex items-center gap-4 md:gap-6">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-border overflow-hidden flex items-center justify-center bg-background shadow-xl">
            {gymData?.logo ? (
              <img src={gymData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="font-black italic text-xl text-[#daa857]">{form.name ? form.name[0].toUpperCase() : 'G'}</span>
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Gym <span className="text-[#daa857]">Settings</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Configure your branding & integrations
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-start md:items-end gap-3">
          <div className="bg-[#daa857]/10 text-[#daa857] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#daa857]/20">
            Plan: {currentPlan.toUpperCase()}
          </div>
          <Button 
            type="button"
            onClick={() => window.location.href = '/admin/billing'}
            className="h-10 px-6 bg-accent hover:bg-accent text-foreground hover:text-foreground focus:text-foreground font-black uppercase tracking-widest rounded-xl text-[10px] border border-border transition-all shadow-lg"
          >
            Manage Plan
          </Button>
        </div>
      </div>

      {/* Action Options Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        
        {/* Branding Modal Trigger */}
        <Dialog open={isBrandingModalOpen} onOpenChange={setIsBrandingModalOpen}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer bg-card border border-border rounded-3xl p-4 md:p-8 hover:border-[#daa857]/30 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 h-16 md:h-24 w-24 rounded-full bg-[#daa857]/5 blur-2xl group-hover:bg-[#daa857]/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857] group-hover:scale-110 transition-transform">
                    <Palette className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-1">Branding</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Name, Colors & Tagline</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-[#daa857] transition-colors" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground rounded-[2.5rem] p-5 md:p-10 max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Branding & <span className="text-[#daa857]">Display</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-relaxed">
                Update your gym's textual identity and brand colors.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => handleSave(e, setSavingBranding, () => setIsBrandingModalOpen(false))} className="space-y-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Gym Name</Label>
                  <Input 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tagline</Label>
                  <Input 
                    value={form.tagline}
                    onChange={e => setForm({...form, tagline: e.target.value})}
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Hero Title</Label>
                  <Input 
                    value={form.heroTitle}
                    onChange={e => setForm({...form, heroTitle: e.target.value})}
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Hero Subtitle</Label>
                  <Input 
                    value={form.heroSubtitle}
                    onChange={e => setForm({...form, heroSubtitle: e.target.value})}
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Primary Color</Label>
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
                      className="flex-1 h-14 bg-background border-border rounded-xl focus:border-[#daa857] font-mono text-sm uppercase px-6"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Secondary Color</Label>
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
                      className="flex-1 h-14 bg-background border-border rounded-xl focus:border-[#daa857] font-mono text-sm uppercase px-6"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-border gap-3 sm:gap-0 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsBrandingModalOpen(false)}
                  className="h-14 px-8 border-border hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={savingBranding}
                  className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
                >
                  {savingBranding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Update Branding'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Media Assets Modal Trigger */}
        <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer bg-card border border-border rounded-3xl p-4 md:p-8 hover:border-[#daa857]/30 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 h-16 md:h-24 w-24 rounded-full bg-[#daa857]/5 blur-2xl group-hover:bg-[#daa857]/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857] group-hover:scale-110 transition-transform">
                    <ImagePlus className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-1">Media</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Logos & Visual Assets</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-[#daa857] transition-colors" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground rounded-[2.5rem] p-5 md:p-10 max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Media <span className="text-[#daa857]">Assets</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-relaxed">
                Upload your gym's visual identity assets directly. Changes save automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {/* Logo Upload */}
              <div className="p-6 bg-background border border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-center group transition-colors hover:border-[#daa857]/30">
                <div className="h-24 w-24 rounded-full border-2 border-border overflow-hidden flex items-center justify-center bg-card shadow-lg">
                  {gymData?.logo ? <img src={gymData.logo} alt="Logo" className="w-full h-full object-contain p-2" /> : <Camera className="text-muted-foreground" />}
                </div>
                <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-[#daa857] px-6 py-3 border border-border rounded-xl bg-card transition-colors">
                  {uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} disabled={!!uploadingField} />
                </Label>
              </div>

              {/* Favicon Upload */}
              <div className="p-6 bg-background border border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-center group transition-colors hover:border-[#daa857]/30">
                <div className="h-24 w-24 rounded-2xl border-2 border-border overflow-hidden flex items-center justify-center bg-card shadow-lg">
                  {gymData?.favicon ? <img src={gymData.favicon} alt="Favicon" className="w-full h-full object-contain p-4" /> : <ImageIcon className="text-muted-foreground" />}
                </div>
                <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-[#daa857] px-6 py-3 border border-border rounded-xl bg-card transition-colors">
                  {uploadingField === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
                  <input type="file" className="hidden" accept="image/x-icon,image/png,image/jpeg" onChange={e => handleFileUpload(e, 'favicon')} disabled={!!uploadingField} />
                </Label>
              </div>

              {/* Hero Video Upload */}
              <div className="p-6 bg-background border border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-center group transition-colors hover:border-[#daa857]/30">
                <div className="h-24 w-24 rounded-2xl border-2 border-border overflow-hidden flex items-center justify-center bg-card shadow-lg">
                  {gymData?.heroVideo ? <Video className="h-10 w-10 text-[#daa857]" /> : <Video className="h-10 w-10 text-muted-foreground" />}
                </div>
                <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-[#daa857] px-6 py-3 border border-border rounded-xl bg-card transition-colors">
                  {uploadingField === 'heroVideo' ? 'Uploading...' : 'Upload Hero Video'}
                  <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, 'heroVideo')} disabled={!!uploadingField} />
                </Label>
              </div>

              {/* Showcase 1 Upload */}
              <div className="p-6 bg-background border border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-center group transition-colors hover:border-[#daa857]/30">
                <div className="h-32 w-full rounded-2xl border-2 border-border overflow-hidden flex items-center justify-center bg-card shadow-lg">
                  {gymData?.showcaseImage1 ? <img src={gymData.showcaseImage1} alt="S1" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" />}
                </div>
                <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-[#daa857] px-6 py-3 border border-border rounded-xl bg-card transition-colors">
                  {uploadingField === 'showcaseImage1' ? 'Uploading...' : 'Showcase Image 1'}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'showcaseImage1')} disabled={!!uploadingField} />
                </Label>
              </div>

              {/* Showcase 2 Upload */}
              <div className="p-6 bg-background border border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-center group transition-colors hover:border-[#daa857]/30">
                <div className="h-32 w-full rounded-2xl border-2 border-border overflow-hidden flex items-center justify-center bg-card shadow-lg">
                  {gymData?.showcaseImage2 ? <img src={gymData.showcaseImage2} alt="S2" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" />}
                </div>
                <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-[#daa857] px-6 py-3 border border-border rounded-xl bg-card transition-colors">
                  {uploadingField === 'showcaseImage2' ? 'Uploading...' : 'Showcase Image 2'}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'showcaseImage2')} disabled={!!uploadingField} />
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-border mt-4">
               <Button 
                  type="button" 
                  onClick={() => setIsMediaModalOpen(false)}
                  className="w-full sm:w-auto h-14 px-10 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
                >
                  Done
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payments Modal Trigger */}
        <Dialog open={isPaymentsModalOpen} onOpenChange={setIsPaymentsModalOpen}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer bg-card border border-border rounded-3xl p-4 md:p-8 hover:border-[#daa857]/30 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 h-16 md:h-24 w-24 rounded-full bg-[#daa857]/5 blur-2xl group-hover:bg-[#daa857]/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857] group-hover:scale-110 transition-transform">
                    <CreditCard className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-1">Paystack</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gateway Configuration</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-[#daa857] transition-colors" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground rounded-[2.5rem] p-5 md:p-10 max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Payment <span className="text-[#daa857]">Gateway</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-relaxed">
                Connect your Paystack account to receive automated subscriptions and payments.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => handleSave(e, setSavingPayments, () => setIsPaymentsModalOpen(false))} className="space-y-6 py-6">
              
              <div className="bg-orange-500/10 border border-orange-500/20 p-5 md:p-6 rounded-2xl space-y-4 mb-6">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">Important Webhook Setup</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-relaxed">
                  These URLs must be copied into your Paystack Dashboard (Settings &gt; API Keys & Webhooks) for automated payments to sync correctly.
                </p>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Callback URL</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 block p-3 bg-background border border-border rounded-xl text-[10px] md:text-xs font-mono text-muted-foreground shadow-inner overflow-x-auto whitespace-nowrap custom-scrollbar">
                        https://{gymData?.slug}.gympilotpro.com/payment/success
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-10 w-10 md:h-11 md:w-11 rounded-xl border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
                        onClick={() => handleCopy(`https://${gymData?.slug}.gympilotpro.com/payment/success`, 'Callback URL')}
                      >
                        <Copy className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Webhook URL</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 block p-3 bg-background border border-border rounded-xl text-[10px] md:text-xs font-mono text-muted-foreground shadow-inner overflow-x-auto whitespace-nowrap custom-scrollbar">
                        https://{gymData?.slug}.gympilotpro.com/api/webhooks/paystack/{gymData?.id}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-10 w-10 md:h-11 md:w-11 rounded-xl border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
                        onClick={() => handleCopy(`https://${gymData?.slug}.gympilotpro.com/api/webhooks/paystack/${gymData?.id}`, 'Webhook URL')}
                      >
                        <Copy className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Paystack Public Key</Label>
                  <Input 
                    value={form.paystackPublicKey}
                    onChange={e => setForm({...form, paystackPublicKey: e.target.value})}
                    type="password"
                    placeholder="pk_test_..."
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold tracking-widest"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Paystack Secret Key</Label>
                  <Input 
                    value={form.paystackSecretKey}
                    onChange={e => setForm({...form, paystackSecretKey: e.target.value})}
                    type="password"
                    placeholder="sk_test_..."
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold tracking-widest"
                  />
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-border gap-3 sm:gap-0 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPaymentsModalOpen(false)}
                  className="h-14 px-8 border-border hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={savingPayments}
                  className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
                >
                  {savingPayments ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save API Keys'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bank Details Modal Trigger */}
        <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer bg-card border border-border rounded-3xl p-4 md:p-8 hover:border-[#daa857]/30 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 h-16 md:h-24 w-24 rounded-full bg-[#daa857]/5 blur-2xl group-hover:bg-[#daa857]/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857] group-hover:scale-110 transition-transform">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-1">Bank Transfer</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Manual Payments Info</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-[#daa857] transition-colors" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground rounded-[2.5rem] p-5 md:p-10 max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Bank <span className="text-[#daa857]">Details</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-relaxed">
                Provide your gym's bank details for manual member renewals and signups.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => handleSave(e, setSavingBank, () => setIsBankModalOpen(false))} className="space-y-6 py-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Bank Name</Label>
                  <Input 
                    value={form.bankName}
                    onChange={e => setForm({...form, bankName: e.target.value})}
                    placeholder="e.g. GTBank, Zenith, FCMB"
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Account Number</Label>
                  <Input 
                    value={form.accountNumber}
                    onChange={e => setForm({...form, accountNumber: e.target.value})}
                    placeholder="0000000000"
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold tracking-widest"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Account Name</Label>
                  <Input 
                    value={form.accountName}
                    onChange={e => setForm({...form, accountName: e.target.value})}
                    placeholder="Legal Gym Name"
                    className="h-14 bg-background border-border rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-border gap-3 sm:gap-0 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsBankModalOpen(false)}
                  className="h-14 px-8 border-border hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={savingBank}
                  className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
                >
                  {savingBank ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save Bank Details'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
