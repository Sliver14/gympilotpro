'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CreditCard } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface ChartData {
  month: string
  revenue: number
  payments: number
}

export default function RevenueAnalytics() {
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // Try aggregated endpoint first, fallback to individual endpoint
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) {
          // Fallback to individual revenue endpoint
          const fallbackResponse = await fetch('/api/admin/revenue')
          const chartData = await fallbackResponse.json()
          setData(chartData)
        } else {
          const data = await response.json()
          setData(data.revenueData || [])
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load revenue data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevenueData()
  }, [toast])

  // Format numbers as Nigerian Naira (₦) with commas
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0, // no kobo if whole number
      maximumFractionDigits: 0,
    }).format(value)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-80 flex items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalPayments = data.reduce((sum, item) => sum + item.payments, 0)
  const avgMonthly = data.length > 0 ? totalRevenue / data.length : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-[#daa857]" /> Financial <span className="text-[#daa857]">Overview</span>
        </CardTitle>
        <CardDescription>Monthly revenue trends and payment history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: 'ALL-TIME' },
            { label: 'Avg. Monthly', value: formatCurrency(avgMonthly), sub: 'MONTHLY AVERAGE', accent: true },
            { label: 'Total Transactions', value: totalPayments.toLocaleString('en-NG'), sub: 'PAYMENT COUNT' }
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-4 md:p-6 hover:border-[#daa857]/50 transition-all group shadow-sm">
              <p className="text-[8px] font-black tracking-[0.2em] text-muted-foreground mb-2">{stat.label}</p>
              <p className={cn("text-2xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left", stat.accent ? "text-[#daa857]" : "text-foreground")}>
                {stat.value}
              </p>
              <p className="text-[8px] font-black text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="p-4 md:p-6 rounded-[2rem] bg-card/30 border border-border shadow-sm overflow-hidden text-muted-foreground">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--muted-foreground)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontWeight: '700' }}
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                  tick={{ fill: 'var(--muted-foreground)', fontWeight: '700' }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: '1.25rem',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: 'var(--foreground)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  itemStyle={{ color: '#daa857' }}
                  labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#daa857" 
                  name="REVENUE" 
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
                <Bar 
                  dataKey="payments" 
                  fill="var(--primary)" 
                  fillOpacity={0.2}
                  name="TRANSACTIONS" 
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-4 opacity-10" />
              <p className="text-xs font-black">No financial data stream detected</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}