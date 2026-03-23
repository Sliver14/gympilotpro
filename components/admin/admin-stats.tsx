'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Users, TrendingUp, Calendar, Clock, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  totalMembers: number
  activeMembers: number
  todayCheckins: number
  pendingPayments: number
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

export default function AdminStats({ 
  hideRevenue = false,
  refreshTrigger = 0 
}: { 
  hideRevenue?: boolean,
  refreshTrigger?: number
}) {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    todayCheckins: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      // setIsLoading(true) // Optional: show loading state on refresh
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
  }, [toast, refreshTrigger])

  if (isLoading) {
    return (
      <div className={cn("grid gap-4", hideRevenue ? "md:grid-cols-4" : "md:grid-cols-5")}>
        {[...Array(hideRevenue ? 4 : 5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="h-16 md:h-24 animate-pulse bg-muted" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 md:gap-6", hideRevenue ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-5")}>
      {[
        { label: 'Total Members', value: stats.totalMembers, sub: 'All registered', icon: Users },
        { label: 'Active Members', value: stats.activeMembers, sub: 'Valid memberships', icon: TrendingUp, accent: true },
        { label: 'Today Check-ins', value: stats.todayCheckins, sub: 'Live activity', icon: Calendar },
        { 
          label: 'Pending Payments', 
          value: stats.pendingPayments, 
          sub: 'Awaiting sync', 
          icon: Clock, 
          warning: stats.pendingPayments > 0 
        },
        ...(!hideRevenue ? [{ 
          label: 'Monthly Revenue', 
          value: formatNaira(stats.monthlyRevenue), 
          sub: 'This month', 
          icon: Wallet,
          accent: true 
        }] : [])
      ].map((item: any, i) => (
        <div 
          key={i} 
          className={cn(
            "bg-card border border-border/50 rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500",
            item.warning && "border-destructive/20 bg-destructive/5 hover:border-destructive/40"
          )}
        >
          <div className="absolute -top-12 -right-12 h-16 md:h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-black tracking-[0.3em] text-muted-foreground">{item.label}</p>
              <item.icon className={cn(
                "h-4 w-4",
                item.accent ? "text-primary" : item.warning ? "text-destructive animate-pulse" : "text-muted-foreground/50"
              )} />
            </div>
            <div>
              <p className={cn(
                "text-2xl md:text-3xl font-black tracking-tighter",
                item.accent ? "text-primary" : "text-foreground",
                item.warning && "text-destructive"
              )}>
                {item.value}
              </p>
              <p className="text-[8px] font-bold text-muted-foreground/60 mt-1">{item.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}