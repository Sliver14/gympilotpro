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
  const subscriptions = await prisma.gymSubscription.findMany({
    orderBy: { endDate: 'asc' },
    include: {
      gym: true
    }
  })

  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const expiringSoonCount = subscriptions.filter(s => {
    const daysLeft = Math.ceil((new Date(s.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return s.status === 'active' && daysLeft <= 7 && daysLeft > 0
  }).length

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
            <div className="text-2xl font-bold text-zinc-100">{subscriptions.length - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">All Subscriptions</CardTitle>
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
              {subscriptions.map((sub) => {
                const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-zinc-100">{sub.gym.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-zinc-900 border-zinc-700 text-zinc-300">
                        {sub.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'active' ? 'default' : 'destructive'} className={
                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                      }>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {new Date(sub.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${
                        daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-orange-500' : 'text-emerald-500'
                      }`}>
                        {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
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
