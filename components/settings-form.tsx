'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Camera, 
  Loader2, 
  Lock, 
  User as UserIcon, 
  Settings, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  Target, 
  ChevronRight,
  Info,
  Crop as CropIcon,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import Cropper, { Area } from 'react-easy-crop'
import getCroppedImg from '@/lib/image-utils'
import { Slider } from '@/components/ui/slider'

interface SettingsFormProps {
  userData: any
  onUpdate?: () => void
}

const FITNESS_GOALS_OPTIONS = [
  { id: 'weight_loss', label: 'Weight Loss / Fat Burning' },
  { id: 'muscle_gain', label: 'Muscle Gain / Hypertrophy' },
  { id: 'strength_endurance', label: 'Strength & Muscle Stamina' },
  { id: 'full_body', label: 'Full Body Workout / General Fitness' },
  { id: 'flexibility', label: 'Improve Flexibility & Mobility' },
  { id: 'endurance', label: 'Cardio Endurance / Stamina' },
  { id: 'sport_specific', label: 'Sport-Specific Training' },
]

export default function SettingsForm({ userData, onUpdate }: SettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isCropperModalOpen, setIsCropperModalOpen] = useState(false)
  
  // Detail Form state
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsForm, setDetailsForm] = useState({
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    phoneNumber: userData.phoneNumber || '',
    gender: userData.memberProfile?.gender || '',
    birthday: userData.memberProfile?.birthday || '',
    fitnessGoals: userData.memberProfile?.fitnessGoals || [],
    fitnessGoalsDetails: userData.memberProfile?.fitnessGoalsDetails || '',
  })

  // Password Form state
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Cropper state
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initials = `${userData.firstName?.[0] ?? ''}${userData.lastName?.[0] ?? ''}`.toUpperCase()
  const profileImage = userData.profileImage || userData.memberProfile?.profileImage
  const accent = '#daa857'

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File size should be less than 5MB', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result as string)
      setIsCropperModalOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    setUploading(true)
    setIsCropperModalOpen(false)

    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)
      if (!croppedImageBlob) throw new Error('Failed to crop image')

      const croppedFile = new File([croppedImageBlob], 'profile.jpg', { type: 'image/jpeg' })
      
      // Update local preview
      const objectUrl = URL.createObjectURL(croppedImageBlob)
      setPreviewUrl(objectUrl)

      const formData = new FormData()
      formData.append('file', croppedFile)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      toast({ title: 'Protocol Updated', description: 'Neural signature image synchronized.' })
      if (onUpdate) onUpdate()
      router.refresh()
    } catch (error) {
      console.error('Crop/Upload error:', error)
      toast({ title: 'Sync Error', description: 'Failed to upload neural signature.', variant: 'destructive' })
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      setImageToCrop(null)
    }
  }

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setDetailsLoading(true)

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detailsForm),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to update details')

      toast({ title: 'Intel Updated', description: 'Command personnel data synchronized successfully.' })
      setIsDetailsModalOpen(false)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' })
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: 'Mismatch', description: 'New security keys do not match.', variant: 'destructive' })
      return
    }

    if (passwords.newPassword.length < 8) {
      toast({ title: 'Weak Key', description: 'Security key must be at least 8 characters.', variant: 'destructive' })
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to change security key')

      toast({ title: 'Vault Secured', description: 'Entry credentials updated successfully.' })
      setIsPasswordModalOpen(false)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast({ title: 'Security Error', description: error.message, variant: 'destructive' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Profile Section */}
      <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#daa857]/5 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group shrink-0">
            <Avatar className={cn(
              "h-44 w-44 border-4 border-[#daa857]/20 transition-all duration-500 group-hover:border-[#daa857]/50 shadow-2xl shadow-[#daa857]/5"
            )}>
              <AvatarImage src={previewUrl || profileImage || undefined} className="object-cover" />
              <AvatarFallback className="text-5xl bg-black font-black uppercase italic text-[#daa857]">
                {initials || '??'}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 h-12 w-12 rounded-full bg-[#daa857] text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
          </div>
          
          <div className="text-center md:text-left space-y-2 flex-1">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
              {userData.firstName} <span className="text-[#daa857]">{userData.lastName}</span>
            </h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">{userData.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <div className="inline-flex items-center rounded-full bg-[#daa857]/10 border border-[#daa857]/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[#daa857]">
                {userData.role} Core
              </div>
              <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Options */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Update Details Modal Trigger */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer bg-[#111] border border-white/5 rounded-3xl p-8 hover:border-[#daa857]/30 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[#daa857]/5 blur-2xl group-hover:bg-[#daa857]/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857] group-hover:scale-110 transition-transform">
                    <UserIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-1">Command Intel</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Update Personal Metrics</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-700 group-hover:text-[#daa857] transition-colors" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-white/10 text-white rounded-[2.5rem] p-10 max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Synchronize <span className="text-[#daa857]">Intel</span>
              </DialogTitle>
              <DialogDescription className="text-gray-500 font-medium uppercase text-[10px] tracking-widest leading-relaxed">
                Update core biometric and identification data for the <span className="text-white font-black">{userData.role}</span> vault profile.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpdateDetails} className="space-y-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">First Identity</Label>
                  <Input 
                    value={detailsForm.firstName}
                    onChange={(e) => setDetailsForm({...detailsForm, firstName: e.target.value})}
                    placeholder={userData.firstName}
                    className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Last Identity</Label>
                  <Input 
                    value={detailsForm.lastName}
                    onChange={(e) => setDetailsForm({...detailsForm, lastName: e.target.value})}
                    placeholder={userData.lastName}
                    className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Comm Channel</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <Input 
                      value={detailsForm.email}
                      onChange={(e) => setDetailsForm({...detailsForm, email: e.target.value})}
                      placeholder={userData.email}
                      className="h-14 pl-12 bg-black border-white/5 rounded-xl focus:border-[#daa857] font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Secure Line</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <Input 
                      value={detailsForm.phoneNumber}
                      onChange={(e) => setDetailsForm({...detailsForm, phoneNumber: e.target.value})}
                      placeholder={userData.phoneNumber || '080XXXXXXXX'}
                      className="h-14 pl-12 bg-black border-white/5 rounded-xl focus:border-[#daa857] font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {userData.role === 'member' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Cycle of Origin (Birthday)</Label>
                      <Input 
                        type="date"
                        value={detailsForm.birthday}
                        onChange={(e) => setDetailsForm({...detailsForm, birthday: e.target.value})}
                        className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Gender Protocol</Label>
                      <Select 
                        value={detailsForm.gender} 
                        onValueChange={(v) => setDetailsForm({...detailsForm, gender: v})}
                      >
                        <SelectTrigger className="h-14 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold uppercase tracking-widest text-[10px]">
                          <SelectValue placeholder="SELECT GENDER" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10 text-white">
                          <SelectItem value="male" className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">MALE</SelectItem>
                          <SelectItem value="female" className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">FEMALE</SelectItem>
                          <SelectItem value="other" className="focus:bg-[#daa857]/10 focus:text-[#daa857] font-bold uppercase text-[10px]">OTHER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mission Intelligence (Fitness Goals)</Label>
                    <Textarea 
                      value={detailsForm.fitnessGoalsDetails}
                      onChange={(e) => setDetailsForm({...detailsForm, fitnessGoalsDetails: e.target.value})}
                      placeholder="Specify your tactical objectives, injuries, or requirements..."
                      className="min-h-[120px] bg-black border-white/5 rounded-2xl focus:border-[#daa857] p-6 font-bold text-xs uppercase tracking-widest leading-relaxed"
                    />
                  </div>
                </>
              )}

              <DialogFooter className="pt-6 border-t border-white/5 gap-3 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500"
                >
                  Abort
                </Button>
                <Button 
                  type="submit" 
                  disabled={detailsLoading}
                  className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
                >
                  {detailsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Synchronize Intel'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal Trigger */}
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer bg-[#111] border border-white/5 rounded-3xl p-8 hover:border-[#daa857]/30 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[#daa857]/5 blur-2xl group-hover:bg-[#daa857]/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857] group-hover:scale-110 transition-transform">
                    <Lock className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-1">Security Key</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Update Entry Credentials</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-700 group-hover:text-[#daa857] transition-colors" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-white/10 text-white rounded-[2.5rem] p-10 max-w-md shadow-2xl">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Entry <span className="text-[#daa857]">Security</span>
              </DialogTitle>
              <DialogDescription className="text-gray-500 font-medium uppercase text-[10px] tracking-widest leading-relaxed">
                Define a new secure hash for vault authentication.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleChangePassword} className="space-y-6 py-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Current Vault Key</Label>
                <Input 
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  required
                  className="h-16 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold"
                />
              </div>
              <div className="space-y-3 pt-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">New Security Key</Label>
                <Input 
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                  placeholder="Min 8 Characters"
                  className="h-16 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Verify New Key</Label>
                <Input 
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required
                  className="h-16 bg-black border-white/5 rounded-xl focus:border-[#daa857] px-6 font-bold"
                />
              </div>

              <DialogFooter className="pt-6 border-t border-white/5 gap-3 sm:gap-0 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500"
                >
                  Abort
                </Button>
                <Button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="flex-1 h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
                >
                  {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Update Key'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <Dialog open={isCropperModalOpen} onOpenChange={setIsCropperModalOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white rounded-[1.5rem] md:rounded-[2.5rem] p-0 overflow-hidden w-[95vw] md:max-w-2xl shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Adjust Profile Signature</DialogTitle>
          </DialogHeader>

          <div className="p-5 md:p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857]">
                <CropIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">Adjust <span className="text-[#daa857]">Signature</span></h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsCropperModalOpen(false)} className="rounded-full hover:bg-white/5">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative h-[300px] md:h-[400px] w-full bg-black">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            )}
          </div>

          <div className="p-5 md:p-8 space-y-6 md:space-y-8 bg-[#111]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Neural Zoom</Label>
                <span className="text-[10px] font-black text-[#daa857]">{Math.round(zoom * 100)}%</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="py-4"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCropperModalOpen(false)}
                className="h-12 md:h-14 px-8 border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCropConfirm}
                className="flex-1 h-12 md:h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
              >
                Sync Optimized Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <div className="bg-[#daa857]/5 border border-[#daa857]/10 rounded-3xl p-8 flex items-start gap-6">
        <div className="h-12 w-12 rounded-2xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857] shrink-0">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase italic tracking-widest text-white mb-2">Protocol Note</h4>
          <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-tighter">
            Changes to core identification metrics may require re-verification by Command Personnel. 
            Maintain accurate data to ensure uninterrupted vault access.
          </p>
        </div>
      </div>

    </div>
  )
}
