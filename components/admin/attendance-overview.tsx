'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

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
          <Spinner className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    )
  }

  const totalCheckins = data.reduce((sum, item) => sum + item.checkins, 0)
  const avgDaily = Math.round(totalCheckins / (data.length || 1))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[#daa857]" /> Attendance <span className="text-[#daa857]">Overview</span>
        </CardTitle>
        <CardDescription>Daily member check-ins and check-outs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {[
            { label: 'Total Checkins', value: totalCheckins, sub: 'LAST 30 DAYS' },
            { label: 'Average Checkins', value: avgDaily, sub: 'DAILY FREQUENCY', accent: true },
            { label: 'Max Checkin', value: Math.max(...data.map((d) => d.checkins), 0), sub: 'MAX DAILY' }
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-card/50 border border-border p-4 md:p-6 hover:border-[#daa857]/20 transition-all group">
              <p className="text-[8px] font-black tracking-[0.2em] text-muted-foreground mb-2">{stat.label}</p>
              <p className={cn("text-2xl font-black italic tracking-tighter group-hover:scale-105 transition-transform origin-left", stat.accent ? "text-[#daa857]" : "text-foreground")}>
                {stat.value}
              </p>
              <p className="text-[8px] font-black text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="p-4 md:p-6 rounded-[2rem] bg-card/50 border border-border">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
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
                  tick={{ fill: '#4b5563', fontWeight: '900' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid rgba(218,168,87,0.2)',
                    borderRadius: '1rem',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                  }}
                  itemStyle={{ color: '#daa857' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="checkins" 
                  stroke="#daa857" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#daa857', strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#daa857', strokeWidth: 2, fill: '#000' }}
                  name="ACCESS" 
                />
                <Line
                  type="monotone"
                  dataKey="checkouts"
                  stroke="#ffffff10"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="CHECK-OUT"
                />
                </LineChart>
                </ResponsiveContainer>
                ) : (
                <div className="h-80 flex flex-col items-center justify-center text-muted-foreground italic">
                <Calendar className="h-12 w-12 mb-4 opacity-10" />
                <p className="text-xs font-black">No attendance data available</p>
                </div>          )}
        </div>
      </CardContent>
    </Card>
  )
}
