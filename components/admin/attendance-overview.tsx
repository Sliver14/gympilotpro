'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar } from 'lucide-react'

interface AttendanceData {
  date: string
  checkins: number
  checkouts: number
}

export default function AttendanceOverview() {
  const [data, setData] = useState<AttendanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Try aggregated endpoint first, fallback to individual endpoint
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) {
          // Fallback to individual attendance endpoint
          const fallbackResponse = await fetch('/api/admin/attendance-chart')
          const chartData = await fallbackResponse.json()
          setData(chartData)
        } else {
          const data = await response.json()
          setData(data.attendanceData || [])
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load attendance data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendanceData()
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

  const totalCheckins = data.reduce((sum, item) => sum + item.checkins, 0)
  const avgDaily = Math.round(totalCheckins / (data.length || 1))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Attendance Overview
        </CardTitle>
        <CardDescription>Daily gym attendance trends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Total Check-ins (30 days)</p>
            <p className="text-2xl font-bold">{totalCheckins}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold">{avgDaily}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Peak Day</p>
            <p className="text-2xl font-bold">
              {Math.max(...data.map((d) => d.checkins), 0)}
            </p>
          </div>
        </div>

        {data.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-background)' }} />
              <Legend />
              <Line type="monotone" dataKey="checkins" stroke="var(--color-primary)" name="Check-ins" />
              <Line type="monotone" dataKey="checkouts" stroke="var(--color-muted-foreground)" name="Check-outs" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
