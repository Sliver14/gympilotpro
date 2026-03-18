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
          <CreditCard className="h-5 w-5 text-[#daa857]" /> Financial <span className="text-[#daa857]">Intelligence</span>
        </CardTitle>
        <CardDescription>Monthly revenue trends and payment history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: 'ALL-TIME' },
            { label: 'Avg. Monthly', value: formatCurrency(avgMonthly), sub: 'MONTHLY AVERAGE', accent: true },
            { label: 'Total Transactions', value: totalPayments.toLocaleString('en-NG'), sub: 'PAYMENT COUNT' }
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-black/40 border border-white/5 p-6 hover:border-[#daa857]/20 transition-all group">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">{stat.label}</p>
              <p className={cn("text-2xl font-black italic tracking-tighter group-hover:scale-105 transition-transform origin-left", stat.accent ? "text-[#daa857]" : "text-white")}>
                {stat.value}
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-700 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#4b5563', fontWeight: '900' }}
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                  tick={{ fill: '#4b5563', fontWeight: '900' }}
                />
                <Tooltip
                  cursor={{ fill: '#daa85705' }}
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    border: '1px solid rgba(218,168,87,0.2)',
                    borderRadius: '1rem',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                  }}
                  itemStyle={{ color: '#daa857' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#daa857" 
                  name="REVENUE (₦)" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar 
                  dataKey="payments" 
                  fill="#ffffff10" 
                  name="TRANSACTIONS" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-gray-700 italic">
              <CreditCard className="h-12 w-12 mb-4 opacity-10" />
              <p className="text-xs font-black uppercase tracking-widest">No financial data stream detected</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}