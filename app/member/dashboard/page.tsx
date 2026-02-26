// 'use client'

// import { useEffect, useState } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Badge } from '@/components/ui/badge'
// import { useToast } from '@/hooks/use-toast'
// import { Dumbbell, LogOut, QrCode, TrendingUp, Calendar, User, AlertCircle } from 'lucide-react'
// import MemberHeader from '@/components/member/member-header'
// import MemberProfile from '@/components/member/member-profile'
// import AttendanceHistory from '@/components/member/attendance-history'
// import ProgressNotes from '@/components/member/progress-notes'
// import QRCodeDisplay from '@/components/member/qr-code-display'

// interface MemberData {
//   id: string
//   email: string
//   firstName: string
//   lastName: string
//   phoneNumber: string
//   memberProfile: {
//     expiryDate: string
//     membership: {
//       name: string
//       price: number
//     }
//     fitnessGoals: string
//     profileImage: string | null
//     emergencyContact: string | null
//     emergencyPhone: string | null
//   }
// }

// interface AttendanceData {
//   id: string
//   checkInTime: string
//   checkOutTime: string | null
//   method: string
// }

// export default function MemberDashboard() {
//   const [memberData, setMemberData] = useState<MemberData | null>(null)
//   const [attendanceHistory, setAttendanceHistory] = useState<AttendanceData[]>([])
//   // --- NEW: Consolidated state for loading and access control ---
//   const [accessStatus, setAccessStatus] = useState<'loading' | 'allowed' | 'unverified' | 'expired'>('loading')
//   const [daysUntilExpiry, setDaysUntilExpiry] = useState(0)
  
//   const router = useRouter()
//   const { toast } = useToast()

//   useEffect(() => {
//     const fetchMemberData = async () => {
//       try {
//         const userResponse = await fetch('/api/auth/user')
//         if (!userResponse.ok) {
//           router.push('/login')
//           return
//         }

//         const userData = await userResponse.json()
        
//         // Redirect if the user is not a member
//         if (userData.role !== 'member' || !userData.memberProfile) {
//           router.push('/login'); // Or to an appropriate page for other roles
//           return;
//         }

//         // --- NEW: Check for verification and expiry ---
//         const { verified, expiryDate } = userData.memberProfile;
//         const expiry = new Date(expiryDate);
//         const now = new Date();
//         const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//         setDaysUntilExpiry(daysRemaining);

//         if (!verified) {
//           if (daysRemaining < 0) {
//             setAccessStatus('expired');
//           } else {
//             setAccessStatus('unverified');
//           }
//           setMemberData(userData) // Set data to show name on blocked page
//           setIsLoading(false) // Compatibility with old state name
//           return;
//         }
        
//         // If we reach here, user is verified and not expired
//         setAccessStatus('allowed');
//         setMemberData(userData);

//         if (daysRemaining <= 7) {
//           toast({
//             title: 'Membership Expiring Soon',
//             description: `Your membership expires in ${daysRemaining} days. Consider renewing now.`,
//           })
//         }

//         // Fetch attendance history only for allowed members
//         const attendanceResponse = await fetch(`/api/members/${userData.id}/attendance`)
//         const attendanceData = await attendanceResponse.json()
//         setAttendanceHistory(attendanceData)

//       } catch (error) {
//         console.error('Error fetching member data:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to load member data',
//           variant: 'destructive',
//         })
//         // Set a generic error status if needed
//       } finally {
//         // Handled by accessStatus now
//       }
//     }

//     fetchMemberData()
//   }, [router, toast])

//   const handleLogout = async () => {
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' })
//       router.push('/login')
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to logout',
//         variant: 'destructive',
//       })
//     }
//   }

//   // --- NEW: Centralized Loading and Access-Denied UI ---
//   if (accessStatus === 'loading') {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-muted-foreground">Loading Your Dashboard...</p>
//       </div>
//     )
//   }
  
//   if (accessStatus === 'unverified') {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <MemberHeader memberData={memberData!} onLogout={handleLogout} />
//         <div className="flex flex-1 items-center justify-center">
//             <Card className="w-full max-w-md text-center">
//                 <CardHeader>
//                     <CardTitle>Account Pending Verification</CardTitle>
//                     <CardDescription>We're almost there!</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <p>Your account is awaiting payment verification from our staff. Please check back later.</p>
//                     <p className="mt-4 text-sm text-muted-foreground">If you have made a payment, please allow some time for processing. For any questions, contact us on WhatsApp.</p>
//                 </CardContent>
//             </Card>
//         </div>
//       </div>
//     );
//   }

//   if (accessStatus === 'expired') {
//       return (
//         <div className="flex min-h-screen flex-col">
//             <MemberHeader memberData={memberData!} onLogout={handleLogout} />
//             <div className="flex flex-1 items-center justify-center">
//                 <Card className="w-full max-w-md text-center border-destructive">
//                     <CardHeader>
//                         <CardTitle className="text-destructive">Membership Expired</CardTitle>
//                         <CardDescription>Your access to the gym has been suspended.</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <p>Your membership expired on {new Date(memberData!.memberProfile.expiryDate).toLocaleDateString()}. Please renew to continue enjoying our facilities.</p>
//                         <Link href="/member/renew-membership">
//                           <Button size="sm" className="mt-4" variant="destructive">
//                               Renew Membership
//                           </Button>
//                         </Link>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//       )
//   }
  
//   if (!memberData) {
//     // This case handles any other unexpected failure to load data
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-muted-foreground">Failed to load member data. Please try again.</p>
//       </div>
//     )
//   }
  
//   const expiryDate = new Date(memberData.memberProfile.expiryDate)

//   // --- RENDER MAIN DASHBOARD ONLY IF ALLOWED ---
//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <MemberHeader memberData={memberData} onLogout={handleLogout} />

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-8">
//         {/* Membership Status Alert (only shows for 'expiring') */}
//         {daysUntilExpiry <= 7 && daysUntilExpiry >= 0 && (
//           <Card className="mb-6 border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20">
//             {/* ... expiring soon card content ... */}
//           </Card>
//         )}

//         {/* Stats Grid */}
//         <div className="mb-8 grid gap-4 md:grid-cols-3">
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-2xl font-bold">{memberData.memberProfile.membership.name}</p>
//               <p className="text-xs text-muted-foreground">
//                 {daysUntilExpiry <= 7 ? 'Expiring Soon' : 'Active'}
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-2xl font-bold">{Math.max(0, daysUntilExpiry)}</p>
//               <p className="text-xs text-muted-foreground">Until {expiryDate.toLocaleDateString()}</p>
//             </CardContent>
//           </Card>
//           {/* ... other stats cards ... */}
//         </div>

//         {/* Main Tabs */}
//         <Tabs defaultValue="overview" className="space-y-4">
//           {/* ... existing tabs and content ... */}
//         </Tabs>
//       </div>
//     </div>
//   )
// }


'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Dumbbell, LogOut, QrCode, TrendingUp, Calendar, User, AlertCircle } from 'lucide-react'
import MemberHeader from '@/components/member/member-header'
import MemberProfile from '@/components/member/member-profile'
import AttendanceHistory from '@/components/member/attendance-history'
import ProgressNotes from '@/components/member/progress-notes'
import QRCodeDisplay from '@/components/member/qr-code-display'

interface MemberData {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  memberProfile: {
    expiryDate: string
    membership: {
      name: string
      price: number
    }
    fitnessGoals: string
    profileImage: string | null
    emergencyContact: string | null
    emergencyPhone: string | null
  }
}

interface AttendanceData {
  id: string
  checkInTime: string
  checkOutTime: string | null
  method: string
}

export default function MemberDashboard() {
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [membershipStatus, setMembershipStatus] = useState<'active' | 'expiring' | 'expired'>('active')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/auth/user')
        if (!userResponse.ok) {
          router.push('/login')
          return
        }

        const userData = await userResponse.json()

        // Fetch member profile
        const profileResponse = await fetch(`/api/members/${userData.id}`)
        const profileData = await profileResponse.json()

        setMemberData(profileData)

        // Check membership status
        const expiryDate = new Date(profileData.memberProfile.expiryDate)
        const today = new Date()
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry < 0) {
          setMembershipStatus('expired')
          toast({
            title: 'Membership Expired',
            description: 'Your membership has expired. Please renew to continue accessing the gym.',
            variant: 'destructive',
          })
        } else if (daysUntilExpiry <= 7) {
          setMembershipStatus('expiring')
          toast({
            title: 'Membership Expiring Soon',
            description: `Your membership expires in ${daysUntilExpiry} days. Consider renewing now.`,
          })
        }

        // Fetch attendance history
        const attendanceResponse = await fetch(`/api/members/${userData.id}/attendance`)
        const attendanceData = await attendanceResponse.json()
        setAttendanceHistory(attendanceData)
      } catch (error) {
        console.error('Error fetching member data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load member data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemberData()
  }, [router, toast])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!memberData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Failed to load member data</p>
      </div>
    )
  }

  const expiryDate = new Date(memberData.memberProfile.expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MemberHeader memberData={memberData} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Membership Status Alert */}
        {membershipStatus === 'expired' && (
          <Card className="mb-6 border-destructive bg-destructive/5">
            <CardContent className="flex items-start gap-4 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Membership Expired</h3>
                <p className="text-sm text-muted-foreground">
                  Your membership expired on {expiryDate.toLocaleDateString()}. Please renew to continue using the gym.
                </p>
                <Link href="/member/renew-membership">
                  <Button size="sm" className="mt-2" variant="default">
                    Renew Membership
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {membershipStatus === 'expiring' && (
          <Card className="mb-6 border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="flex items-start gap-4 pt-6">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-600">Membership Expiring Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Your membership expires in {daysUntilExpiry} days on {expiryDate.toLocaleDateString()}. Consider renewing early.
                </p>
                <Link href="/member/renew-membership">
                  <Button size="sm" className="mt-2" variant="outline">
                    Renew Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{memberData.memberProfile.membership.name}</p>
              <p className="text-xs text-muted-foreground">
                {membershipStatus === 'active' && 'Active'}
                {membershipStatus === 'expiring' && 'Expiring Soon'}
                {membershipStatus === 'expired' && 'Expired'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Math.max(0, daysUntilExpiry)}</p>
              <p className="text-xs text-muted-foreground">Until {expiryDate.toLocaleDateString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {attendanceHistory.filter((a) => {
                  const date = new Date(a.checkInTime)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">Visits</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="qr-code" className="gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <MemberProfile memberData={memberData} />
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr-code">
            <QRCodeDisplay memberId={memberData.id} />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <AttendanceHistory attendance={attendanceHistory} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <ProgressNotes memberId={memberData.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
