import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
    { name: 'Active SaaS Subscriptions', value: activeSubs, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Total Revenue', value: `₦${(totalRevenue._sum.amount || 0).toLocaleString()}`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500">Manage all gyms and monitor platform performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.name}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Gyms */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Registered Gyms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Gym Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {(await prisma.gym.findMany({
                  orderBy: { createdAt: 'desc' },
                  take: 5
                })).map((gym) => (
                  <tr key={gym.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium text-gray-900">{gym.name}</td>
                    <td className="px-6 py-4">{gym.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        gym.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {gym.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(gym.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
