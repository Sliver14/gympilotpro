'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'
import { Download, Search, TrendingUp, Users, Activity, Wallet, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemberAnalytics {
  id: string
  name: string
  email: string
  status: string
  package: string
  joinDate: string
  expiryDate: string
  totalPaid: number
}

interface AnalyticsData {
  mrr: number // Monthly Recurring Revenue
  churnRate: number
  retentionRate: number
  packageBreakdown: { name: string, count: number, revenue: number }[]
  members: MemberAnalytics[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        } else {
          throw new Error('Failed to fetch analytics')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        toast({
          title: 'Error',
          description: 'Failed to load advanced analytics data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Level KPIs */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Projected MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">
              {formatCurrency(data.mrr)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Monthly Recurring Revenue based on active subs</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-500/10 blur-2xl group-hover:bg-green-500/20 transition-all" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Retention Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">
              {data.retentionRate.toFixed(1)}%
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Members actively renewing packages</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-destructive/10 blur-2xl group-hover:bg-destructive/20 transition-all" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
              <Users className="h-4 w-4 text-destructive" />
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">
              {data.churnRate.toFixed(1)}%
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Drop-off rate over the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Package Popularity Breakdown */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Package Revenue Split
            </CardTitle>
            <CardDescription>Revenue distribution by active memberships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
            {data.packageBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No active package data</p>
            ) : (
              data.packageBreakdown.map((pkg, i) => {
                const totalRev = data.packageBreakdown.reduce((sum, p) => sum + p.revenue, 0)
                const percentage = totalRev > 0 ? Math.round((pkg.revenue / totalRev) * 100) : 0
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-foreground">{pkg.name}</span>
                      <span className="font-bold text-primary">{formatCurrency(pkg.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span>{pkg.count} members</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
        
        {/* Retention Summary */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Growth Summary
            </CardTitle>
            <CardDescription>Key health indicators for your gym</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
             <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-4">
                <div className="flex justify-between items-center">
                   <p className="text-xs font-bold text-muted-foreground">Active Memberships</p>
                   <p className="text-sm font-black text-foreground">{data.members.filter(m => m.status !== 'expired').length}</p>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-xs font-bold text-muted-foreground">Total Revenue Collected</p>
                   <p className="text-sm font-black text-foreground">{formatCurrency(data.members.reduce((sum, m) => sum + m.totalPaid, 0))}</p>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-xs font-bold text-muted-foreground">Avg. Lifetime Value (LTV)</p>
                   <p className="text-sm font-black text-foreground">{formatCurrency(data.members.length > 0 ? data.members.reduce((sum, m) => sum + m.totalPaid, 0) / data.members.length : 0)}</p>
                </div>
             </div>
             <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Analytics are calculated based on rolling 30-day windows and active subscription normalization.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}