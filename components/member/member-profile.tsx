'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Phone, Users, Zap } from 'lucide-react'

interface MemberProfileProps {
  memberData: any
}

// Currency formatter for Nigerian Naira (₦)
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0, // no kobo for whole numbers
    maximumFractionDigits: 0,
  }).format(value)

export default function MemberProfile({ memberData }: MemberProfileProps) {
  const initials = `${memberData.firstName?.[0] ?? ''}${memberData.lastName?.[0] ?? ''}`.toUpperCase()

  // Safely access nested data with fallbacks
  const profile = memberData?.memberProfile || {}
  const membership = profile.membership || {}

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.profileImage || undefined} alt="Profile" />
              <AvatarFallback className="text-lg">{initials || '??'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {memberData.firstName} {memberData.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{memberData.email}</p>
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