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
import { Building2, Users, CreditCard, Activity } from 'lucide-react'

export default async function SaaSAdminDashboard() {
  // Fetch platform-wide stats
  const [gymCount, memberCount, totalRevenue, activeSubs] = await Promise.all([
    prisma.gym.count(),
    prisma.memberProfile.count(),
    prisma.saaSPayment.aggregate({
      _sum: { amount: true },
      where: { status: 'success' }
    }),
    prisma.gymSubscription.count({
      where: { status: 'active' }
    })
  ])

  const stats = [
    { name: 'Total Gyms', value: gymCount, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10 border border-blue-500/20' },
    { name: 'Total Members', value: memberCount, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
    { name: 'Active Subscriptions', value: activeSubs, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20' },
    { name: 'Total Revenue', value: `₦${(totalRevenue._sum.amount || 0).toLocaleString()}`, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
  ]

  const recentGyms = await prisma.gym.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Platform Overview</h1>
        <p className="text-zinc-400 mt-1">Manage all gyms and monitor platform performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="shadow-sm bg-zinc-950/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.name}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-100">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Gyms */}
      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Recently Registered Gyms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Gym Name</TableHead>
                <TableHead className="text-zinc-400">Slug</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-right text-zinc-400">Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGyms.length > 0 ? (
                recentGyms.map((gym) => (
                  <TableRow key={gym.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-zinc-100">{gym.name}</TableCell>
                    <TableCell className="text-zinc-400">{gym.slug}</TableCell>
                    <TableCell>
                      <Badge variant={gym.status === 'active' ? 'default' : 'secondary'} className={
                        gym.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
                      }>
                        {gym.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-zinc-400">
                      {new Date(gym.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell colSpan={4} className="text-center py-6 text-zinc-500 italic">
                    No gyms registered yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
