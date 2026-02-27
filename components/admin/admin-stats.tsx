'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Users, TrendingUp, Calendar } from 'lucide-react'

interface Stats {
  totalMembers: number
  activeMembers: number
  todayCheckins: number
  monthlyRevenue: number
}

// Reusable Naira formatter
const formatNaira = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    todayCheckins: 0,
    monthlyRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try aggregated endpoint first, fallback to individual endpoint
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) {
          // Fallback to individual stats endpoint
          const fallbackResponse = await fetch('/api/admin/stats')
          const data = await fallbackResponse.json()
          setStats(data)
        } else {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        toast({
          title: 'Error',
          description: 'Failed to load statistics',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="h-24 animate-pulse bg-muted" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Total Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString('en-NG')}</div>
          <p className="text-xs text-muted-foreground">All registered members</p>
        </CardContent>
      </Card>

      {/* Active Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeMembers.toLocaleString('en-NG')}</div>
          <p className="text-xs text-muted-foreground">Valid memberships</p>
        </CardContent>
      </Card>

      {/* Today's Check-ins */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayCheckins.toLocaleString('en-NG')}</div>
          <p className="text-xs text-muted-foreground">Gym visits today</p>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <span className="text-primary text-xl font-bold opacity-50">₦</span> {/* Replaced DollarSign with ₦ */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNaira(stats.monthlyRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  )
}