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
import { Building2, Users, CreditCard, Activity, PhoneCall, AlertCircle } from 'lucide-react'

export default async function SaaSAdminDashboard() {
  const now = new Date()

  // Fetch platform-wide stats
  const [
    gymCount, 
    memberCount, 
    totalRevenue, 
    activeGymCount, 
    expiredGymCount,
    leadCount
  ] = await Promise.all([
    prisma.gym.count(),
    prisma.memberProfile.count(),
    prisma.saaSPayment.aggregate({
      _sum: { amount: true },
      where: { status: 'success' }
    }),
    prisma.gym.count({
      where: {
        subscriptions: {
          some: {
            status: 'active',
            endDate: { gt: now }
          }
        }
      }
    }),
    prisma.gym.count({
      where: {
        AND: [
          {
            subscriptions: {
              some: { endDate: { lte: now } }
            }
          },
          {
            subscriptions: {
              none: {
                status: 'active',
                endDate: { gt: now }
              }
            }
          }
        ]
      }
    }),
    prisma.lead.count()
  ])

  const stats = [
    { name: 'Total Gyms', value: gymCount, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10 border border-blue-500/20' },
    { name: 'Active Gyms', value: activeGymCount, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
    { name: 'Expired/Inactive', value: expiredGymCount, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border border-red-500/20' },
    { name: 'Total Revenue', value: `₦${(totalRevenue._sum.amount || 0).toLocaleString()}`, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
    { name: 'Demo Leads', value: leadCount, icon: PhoneCall, color: 'text-pink-400', bg: 'bg-pink-500/10 border border-pink-500/20' },
  ]

  const recentGyms = await prisma.gym.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      subscriptions: {
        orderBy: { endDate: 'desc' },
        take: 1
      }
    }
  })

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight text-white">Platform Overview</h1>
        <p className="text-zinc-400 mt-1">Manage all gyms and monitor platform performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="shadow-sm bg-zinc-950/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.name}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-100 text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Gyms */}
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-white">Recently Registered Gyms</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableHead className="text-zinc-400">Gym Name</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGyms.length > 0 ? (
                  recentGyms.map((gym) => (
                    <TableRow key={gym.id} className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell className="font-medium text-zinc-100 text-white">{gym.name}</TableCell>
                      <TableCell>
                        {(() => {
                          const activeSub = gym.subscriptions.find(s => s.status === 'active' && new Date(s.endDate) > now)
                          if (activeSub) {
                            return (
                              <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 uppercase text-[10px] font-black">
                                Active
                              </Badge>
                            )
                          }

                          const hasExpired = gym.subscriptions.some(s => new Date(s.endDate) <= now)
                          if (hasExpired) {
                            return (
                              <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 uppercase text-[10px] font-black">
                                Expired
                              </Badge>
                            )
                          }

                          return (
                            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 uppercase text-[10px] font-black">
                              {gym.status}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell className="text-right text-sm text-zinc-400">
                        {new Date(gym.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>                  ))
                ) : (
                  <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell colSpan={3} className="text-center py-6 text-zinc-500 italic">
                      No gyms registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-white">New Demo Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableHead className="text-zinc-400">Gym Name</TableHead>
                  <TableHead className="text-zinc-400">Members</TableHead>
                  <TableHead className="text-right text-zinc-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <TableRow key={lead.id} className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell className="font-medium text-zinc-100 text-white">
                        <div>
                          <p>{lead.gymName}</p>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">{lead.phoneNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-400 font-black">
                          {lead.memberCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-zinc-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell colSpan={3} className="text-center py-6 text-zinc-500 italic">
                      No leads captured yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
