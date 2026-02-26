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
        const response = await fetch('/api/admin/revenue')
        const chartData = await response.json()
        setData(chartData)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Revenue Analytics
        </CardTitle>
        <CardDescription>Monthly revenue and payment data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Total Revenue (12 months)</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Average Monthly</p>
            <p className="text-2xl font-bold">${(totalRevenue / (data.length || 1)).toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.payments, 0)}</p>
          </div>
        </div>

        {data.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-background)' }} />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-primary)" name="Revenue ($)" />
              <Bar dataKey="payments" fill="var(--color-muted-foreground)" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
