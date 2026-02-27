'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CreditCard } from 'lucide-react'

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
          <p className="text-muted-foreground">Loading...</p>
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
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Revenue Analytics
        </CardTitle>
        <CardDescription>Monthly revenue and payment data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Total Revenue (12 months)</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Average Monthly</p>
            <p className="text-2xl font-bold">{formatCurrency(avgMonthly)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{totalPayments.toLocaleString('en-NG')}</p>
          </div>
        </div>

        {/* Chart */}
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), null]}
                contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="var(--primary)" name="Revenue (₦)" />
              <Bar dataKey="payments" fill="var(--muted-foreground)" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No revenue data available yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}