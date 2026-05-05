import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Activity, Clock, AlertTriangle } from 'lucide-react'

export default async function SubscribersPage() {
  const gyms = await prisma.gym.findMany({
    include: {
      subscriptions: {
        orderBy: { endDate: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const now = new Date()

  const gymSubData = gyms.map(gym => {
    const lastSub = gym.subscriptions[0]
    let status = 'inactive'
    let daysLeft = -1

    if (gym.status === 'inactive') {
      status = 'inactive'
    } else if (lastSub) {
      daysLeft = Math.ceil((new Date(lastSub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (lastSub.status === 'active' && daysLeft > 0) {
        status = 'active'
      } else if (daysLeft <= 0) {
        status = 'expired'
      } else {
        status = lastSub.status
      }
    } else if (gym.status === 'active') {
      // Gym is active but has no subscription record? Should be pending or something
      status = 'pending'
    } else {
      status = gym.status || 'pending'
    }

    return {
      id: gym.id,
      gymName: gym.name,
      plan: lastSub?.plan || 'None',
      status,
      startDate: lastSub?.startDate,
      endDate: lastSub?.endDate,
      daysLeft
    }
  })

  const activeCount = gymSubData.filter(s => s.status === 'active').length
  const expiringSoonCount = gymSubData.filter(s => {
    return s.status === 'active' && s.daysLeft <= 7 && s.daysLeft > 0
  }).length
  const inactiveCount = gymSubData.filter(s => s.status === 'expired' || s.status === 'inactive' || s.status === 'pending').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Subscription Management</h1>
        <p className="text-zinc-400 mt-1">Track and manage gym platform subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Subscriptions</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Expiring Soon (7 Days)</CardTitle>
            <Clock className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{expiringSoonCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Expired/Inactive</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">All Gyms & Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Gym</TableHead>
                <TableHead className="text-zinc-400">Plan</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Start Date</TableHead>
                <TableHead className="text-zinc-400">End Date</TableHead>
                <TableHead className="text-zinc-400">Days Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gymSubData.map((sub) => {
                return (
                  <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-zinc-100">{sub.gymName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-zinc-900 border-zinc-700 text-zinc-300">
                        {sub.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={sub.status === 'active' ? 'default' : 'destructive'} 
                        className={
                          sub.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' 
                            : sub.status === 'expired'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border border-zinc-500/20'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${
                        sub.daysLeft < 0 
                          ? 'text-red-500' 
                          : sub.daysLeft <= 7 
                          ? 'text-orange-500' 
                          : 'text-emerald-500'
                      }`}>
                        {sub.daysLeft < 0 
                          ? sub.startDate ? 'Expired' : 'N/A'
                          : `${sub.daysLeft} days`}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
