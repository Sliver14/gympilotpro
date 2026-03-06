'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Phone, Users, Zap, Camera, Loader2 } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-primary/10">
                <AvatarImage src={previewUrl || profileImage || undefined} alt="Profile" className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/5">{initials || '??'}</AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md transition-transform group-hover:scale-110"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
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
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold">
                {memberData.firstName} {memberData.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{memberData.email}</p>
              {memberData.role && (
                <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {memberData.role.charAt(0).toUpperCase() + memberData.role.slice(1)}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{memberData.email}</p>
              </div>
            </div>

            {memberData.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{memberData.phoneNumber}</p>
                </div>
              </div>
            )}

            {profile.emergencyContact && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Emergency Contact</p>
                  <p className="text-sm font-medium">{profile.emergencyContact}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fitness Goals Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Fitness Goals
          </CardTitle>
          <CardDescription>Your personal fitness objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {profile.fitnessGoals || 'No fitness goals set yet.'}
          </p>
          {profile.fitnessGoalsDetails && (
            <p className="mt-3 text-sm text-muted-foreground">
              Details: {profile.fitnessGoalsDetails}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Membership Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="text-sm font-medium">{membership.name || '—'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-sm font-bold">
              {membership.price ? formatCurrency(membership.price) : '—'}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Valid Until</p>
            <p className="text-sm font-medium">
              {profile.expiryDate
                ? new Date(profile.expiryDate).toLocaleDateString('en-GB')
                : '—'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}