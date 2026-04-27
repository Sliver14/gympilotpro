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
    { name: 'Total Gyms', value: gymCount, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Members', value: memberCount, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Active Subscriptions', value: activeSubs, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Total Revenue', value: `₦${(totalRevenue._sum.amount || 0).toLocaleString()}`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const recentGyms = await prisma.gym.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Manage all gyms and monitor platform performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.name}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Gyms */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recently Registered Gyms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gym Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGyms.length > 0 ? (
                recentGyms.map((gym) => (
                  <TableRow key={gym.id}>
                    <TableCell className="font-medium text-gray-900">{gym.name}</TableCell>
                    <TableCell className="text-gray-500">{gym.slug}</TableCell>
                    <TableCell>
                      <Badge variant={gym.status === 'active' ? 'default' : 'secondary'} className={
                        gym.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                      }>
                        {gym.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {new Date(gym.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500 italic">
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
