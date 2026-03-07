import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#daa857]" /> Deployment <span className="text-[#daa857]">Log</span>
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Mission Data</p>
        </div>

        {sortedAttendance.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest italic">No mission records found in the vault.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAttendance.map((record) => (
              <div key={record.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-2xl bg-black/40 border border-white/5 p-6 hover:border-[#daa857]/30 transition-colors group">
                <div className="space-y-1 mb-4 md:mb-0">
                  <p className="text-sm font-black text-white uppercase italic tracking-tight">{formatTime(record.checkInTime)}</p>
                  <p className="text-[10px] font-bold text-[#daa857] uppercase tracking-widest">
                    Mission Duration: <span className="text-gray-400">{getDuration(record.checkInTime, record.checkOutTime)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">AUTH METHOD</p>
                    <p className="text-[10px] font-black text-white uppercase">{record.method === 'qr' ? 'Neural Link (QR)' : 'Manual Override'}</p>
                  </div>
                  <Badge className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-tighter transition-all",
                    record.method === 'qr' ? "bg-[#daa857] text-black" : "bg-white/10 text-white"
                  )}>
                    {record.method === 'qr' ? 'Verified' : 'Manual'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {sortedAttendance.length > 0 && (
          <div className="mt-12 grid gap-4 grid-cols-1 md:grid-cols-3 border-t border-white/5 pt-10">
            {[
              { label: 'Total Checkins', value: sortedAttendance.length },
              { label: 'Current Cycle', value: sortedAttendance.filter((a) => {
                const date = new Date(a.checkInTime)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length, sub: 'THIS MONTH' },
              { label: 'Active Streak', value: sortedAttendance.filter((a) => {
                const date = new Date(a.checkInTime)
                const today = new Date()
                return (
                  date.toDateString() === today.toDateString() ||
                  (date.getTime() <= today.getTime() && date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000)
                )
              }).length, sub: 'LAST 7 DAYS' }
            ].map((stat, i) => (
              <div key={i} className="bg-black/60 border border-white/5 rounded-2xl p-6 text-center group hover:border-[#daa857]/20 transition-all">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-black text-white italic tracking-tighter group-hover:text-[#daa857] transition-colors">{stat.value}</p>
                {stat.sub && <p className="text-[8px] font-black uppercase tracking-widest text-gray-700 mt-1">{stat.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
