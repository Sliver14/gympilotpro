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
  const [searchQuery, setSearchQuery] = useState('')
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

  const handleExportCSV = () => {
    if (!data || data.members.length === 0) return

    // Define CSV headers
    const headers = ['Name', 'Email', 'Status', 'Package', 'Join Date', 'Expiry Date', 'Total Paid (NGN)']
    
    // Map rows
    const rows = filteredMembers.map(m => [
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.status}"`,
      `"${m.package}"`,
      `"${new Date(m.joinDate).toLocaleDateString()}"`,
      `"${new Date(m.expiryDate).toLocaleDateString()}"`,
      m.totalPaid
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `gym_analytics_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!data) return null

  const filteredMembers = data.members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.package.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Package Popularity Breakdown */}
        <Card className="lg:col-span-1 border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Package Revenue Split
            </CardTitle>
            <CardDescription>Revenue distribution by active memberships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

        {/* Detailed Data Table */}
        <Card className="lg:col-span-2 border-border shadow-md flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
            <div>
              <CardTitle className="text-lg">Detailed Member Data</CardTitle>
              <CardDescription>Customizable search and data extraction</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background border-border h-10 w-full"
                />
              </div>
              <Button 
                onClick={handleExportCSV}
                variant="outline" 
                className="w-full sm:w-auto h-10 border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 font-bold"
              >
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden relative min-h-[400px]">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/30 sticky top-0 backdrop-blur-md z-10 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Package</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Lifetime Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                            member.status === 'active' ? "bg-primary/10 text-primary border border-primary/20" :
                            member.status === 'expiring' ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" :
                            "bg-destructive/10 text-destructive border border-destructive/20"
                          )}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{member.package}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(member.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold text-right text-foreground">
                          {formatCurrency(member.totalPaid)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}