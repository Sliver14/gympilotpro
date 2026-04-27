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
          <h1 className="text-3xl font-bold text-gray-900">Gym Management</h1>
          <p className="text-gray-500">Monitor and manage all gym tenants on the platform.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Registered Gyms ({gyms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gym Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members/Staff</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gyms.map((gym) => (
                <TableRow key={gym.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{gym.name}</span>
                      <span className="text-xs text-gray-500">{gym.slug}.gympilotpro.com</span>
                      <div className="flex gap-2 mt-1">
                        {gym.email && (
                          <div className="flex items-center text-[10px] text-gray-400">
                            <Mail className="w-3 h-3 mr-1" />
                            {gym.email}
                          </div>
                        )}
                        {gym.phone && (
                          <div className="flex items-center text-[10px] text-gray-400">
                            <Phone className="w-3 h-3 mr-1" />
                            {gym.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={gym.status === 'active' ? 'default' : 'secondary'} className={
                      gym.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                    }>
                      {gym.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{gym._count.users}</span> members
                      <br />
                      <span className="text-xs text-gray-500">{gym._count.staffProfiles} staff members</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {gym.subscriptions[0] ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{gym.subscriptions[0].plan}</span>
                        <span className="text-[10px] text-gray-500">
                          Expires: {new Date(gym.subscriptions[0].endDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No active plan</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(gym.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
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
