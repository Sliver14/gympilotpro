'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Users, Zap, Camera, Loader2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface MemberProfileProps {
  memberData: any
  onUpdate?: () => void
}

// Currency formatter for Nigerian Naira (₦)
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0, // no kobo for whole numbers
    maximumFractionDigits: 0,
  }).format(value)

export default function MemberProfile({ memberData, onUpdate }: MemberProfileProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const initials = `${memberData.firstName?.[0] ?? ''}${memberData.lastName?.[0] ?? ''}`.toUpperCase()

  // Safely access nested data with fallbacks
  const profile = memberData?.memberProfile || {}
  const membership = profile.membership || {}
  const profileImage = memberData.profileImage || profile.profileImage

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB')
      return
    }

    // Create immediate preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      toast.success('Profile picture updated')
      if (onUpdate) onUpdate()
      router.refresh() // Keep for RSC if any
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
      // Clear preview on failure
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Profile & Info */}
      <div className="space-y-8">
        <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-[#daa857]/20 group-hover:border-[#daa857]/50 transition-all duration-500">
                  <AvatarImage src={previewUrl || profileImage || undefined} alt="Profile" className="object-cover" />
                  <AvatarFallback className="text-4xl bg-black font-black uppercase italic text-[#daa857]">{initials || '??'}</AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-[#daa857] text-black shadow-xl hover:scale-110 active:scale-95 transition-all"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleUpload}
                />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  {memberData.firstName} <span className="text-[#daa857]">{memberData.lastName}</span>
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{memberData.email}</p>
                {memberData.role && (
                  <div className="mt-4 inline-flex items-center rounded-full bg-[#daa857]/10 border border-[#daa857]/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[#daa857]">
                    {memberData.role} Protocol
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-[#daa857]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Comm Channel</p>
                  <p className="text-xs font-bold text-white truncate max-w-[150px]">{memberData.email}</p>
                </div>
              </div>

              {memberData.phoneNumber && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-[#daa857]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Secure Line</p>
                    <p className="text-xs font-bold text-white">{memberData.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Membership Details */}
        <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
              <Zap className="h-5 w-5 text-[#daa857]" /> Membership <span className="text-[#daa857]">Status</span>
            </h3>
            <Badge className="bg-[#daa857] text-black font-black uppercase italic text-[10px] tracking-tighter">Elite Active</Badge>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Selected Tier</p>
              <p className="text-sm font-black text-white italic">{membership.name || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Investment</p>
              <p className="text-xl font-black text-[#daa857] italic">
                {membership.price ? formatCurrency(membership.price) : '—'}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Vault Validity</p>
              <div className="text-right">
                <p className="text-sm font-black text-white">
                  {profile.expiryDate
                    ? new Date(profile.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </p>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Standard Zulu Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fitness Goals & Protocol */}
      <div className="space-y-8">
        <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 shadow-2xl h-full relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />
          
          <div className="relative z-10 space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-[#daa857]/10 flex items-center justify-center text-[#daa857]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Mission <span className="text-[#daa857]">Intelligence</span></h3>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Primary Objectives</p>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 min-h-[100px]">
                  <p className="text-sm font-bold text-gray-300 leading-relaxed italic">
                    {profile.fitnessGoals || 'No primary objectives defined in the protocol.'}
                  </p>
                </div>
              </div>

              {profile.fitnessGoalsDetails && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Tactical Details</p>
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                    <p className="text-xs font-medium text-gray-400 leading-relaxed">
                      {profile.fitnessGoalsDetails}
                    </p>
                  </div>
                </div>
              )}

              {profile.emergencyContact && (
                <div className="mt-auto pt-8 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 text-center">Emergency Extraction Protocol</p>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-700 mb-1">Liaison</p>
                      <p className="text-sm font-black text-white italic">{profile.emergencyContact}</p>
                    </div>
                    {profile.emergencyPhone && (
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-700 mb-1">Comm Line</p>
                        <p className="text-sm font-black text-[#daa857]">{profile.emergencyPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}