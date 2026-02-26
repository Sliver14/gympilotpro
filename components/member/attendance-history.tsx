import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

interface AttendanceRecord {
  id: string
  checkInTime: string
  checkOutTime: string | null
  method: string
}

interface AttendanceHistoryProps {
  attendance: AttendanceRecord[]
}

export default function AttendanceHistory({ attendance }: AttendanceHistoryProps) {
  const sortedAttendance = [...attendance].sort(
    (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return 'Still in gym'

    const checkInTime = new Date(checkIn).getTime()
    const checkOutTime = new Date(checkOut).getTime()
    const durationMs = checkOutTime - checkInTime
    const minutes = Math.floor(durationMs / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Attendance History
        </CardTitle>
        <CardDescription>Your recent gym visits</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedAttendance.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No attendance records yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedAttendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex-1">
                  <p className="font-medium">{formatTime(record.checkInTime)}</p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {getDuration(record.checkInTime, record.checkOutTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={record.method === 'qr' ? 'default' : 'secondary'}>
                    {record.method === 'qr' ? 'QR Code' : 'Manual'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {sortedAttendance.length > 0 && (
          <div className="mt-6 grid gap-3 border-t border-border pt-6 md:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{sortedAttendance.length}</p>
              <p className="text-xs text-muted-foreground">Total Visits</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">
                {sortedAttendance.filter((a) => {
                  const date = new Date(a.checkInTime)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">
                {sortedAttendance.filter((a) => {
                  const date = new Date(a.checkInTime)
                  const today = new Date()
                  return (
                    date.toDateString() === today.toDateString() ||
                    (date.getTime() <= today.getTime() && date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000)
                  )
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">Last 7 Days</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
