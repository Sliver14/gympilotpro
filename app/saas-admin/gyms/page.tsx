import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Building2, ExternalLink, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function GymsPage() {
  const gyms = await prisma.gym.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          users: { where: { role: 'member' } },
          staffProfiles: true
        }
      },
      subscriptions: {
        orderBy: { endDate: 'desc' },
        take: 1
      }
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Gym Management</h1>
          <p className="text-zinc-400 mt-1">Monitor and manage all gym tenants on the platform.</p>
        </div>
      </div>

      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">All Registered Gyms ({gyms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Gym Details</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Members/Staff</TableHead>
                <TableHead className="text-zinc-400">Current Plan</TableHead>
                <TableHead className="text-zinc-400">Joined Date</TableHead>
                <TableHead className="text-right text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gyms.map((gym) => (
                <TableRow key={gym.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-100">{gym.name}</span>
                      <span className="text-xs text-zinc-500">{gym.slug}.gympilotpro.com</span>
                      <div className="flex gap-2 mt-1">
                        {gym.email && (
                          <div className="flex items-center text-[10px] text-zinc-400">
                            <Mail className="w-3 h-3 mr-1 text-zinc-500" />
                            {gym.email}
                          </div>
                        )}
                        {gym.phone && (
                          <div className="flex items-center text-[10px] text-zinc-400">
                            <Phone className="w-3 h-3 mr-1 text-zinc-500" />
                            {gym.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={gym.status === 'active' ? 'default' : 'secondary'} className={
                      gym.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
                    }>
                      {gym.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-zinc-300">
                      <span className="font-medium text-zinc-100">{gym._count.users}</span> members
                      <br />
                      <span className="text-xs text-zinc-500">{gym._count.staffProfiles} staff members</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {gym.subscriptions[0] ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200 capitalize">{gym.subscriptions[0].plan}</span>
                        <span className="text-[10px] text-zinc-500">
                          Expires: {new Date(gym.subscriptions[0].endDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-500 italic">No active plan</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {new Date(gym.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" asChild>
                      <Link href={`/saas-admin/gyms/${gym.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
