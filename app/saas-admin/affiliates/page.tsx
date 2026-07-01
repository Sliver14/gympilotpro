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
import { Users, TrendingUp, DollarSign, Award } from 'lucide-react'
import MarkPaidButton from './mark-paid-button'

export const dynamic = 'force-dynamic'

export default async function AffiliatesAdminPage() {
  const affiliates = await prisma.affiliate.findMany({
    include: {
      referrals: true,
      commissions: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const commissions = await prisma.commission.findMany({
    include: {
      affiliate: true,
      gym: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalReferrals = affiliates.reduce((acc, curr) => acc + curr.referrals.length, 0)
  
  const totalEarned = commissions.reduce((acc, curr) => acc + curr.amount, 0)
  const totalPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalOutstanding = totalEarned - totalPaid

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Affiliate Program</h1>
        <p className="text-zinc-400 mt-1">Manage partner registrations, referrals, and commission payouts.</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Affiliates</CardTitle>
            <Users className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{affiliates.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Referred Gyms</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{totalReferrals}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Paid Commissions</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">₦{totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Outstanding Payouts</CardTitle>
            <Award className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">₦{totalOutstanding.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliates List */}
      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Partners / Affiliates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Code</TableHead>
                <TableHead className="text-zinc-400">Referrals</TableHead>
                <TableHead className="text-zinc-400">Total Earned</TableHead>
                <TableHead className="text-zinc-400">Join Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.length > 0 ? (
                affiliates.map((affiliate) => {
                  const earned = affiliate.commissions.reduce((acc, c) => acc + c.amount, 0)
                  return (
                    <TableRow key={affiliate.id} className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell className="font-bold text-sm text-zinc-300">{affiliate.name}</TableCell>
                      <TableCell className="text-sm text-zinc-300">{affiliate.email}</TableCell>
                      <TableCell className="font-mono text-xs text-orange-500">{affiliate.referralCode}</TableCell>
                      <TableCell className="text-sm text-zinc-300">{affiliate.referrals.length}</TableCell>
                      <TableCell className="font-medium text-zinc-100">₦{earned.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-zinc-400">
                        {new Date(affiliate.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-500 italic">
                    No affiliates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commissions payout queue */}
      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Commission Payout Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Affiliate</TableHead>
                <TableHead className="text-zinc-400">Referred Gym</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Date Generated</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length > 0 ? (
                commissions.map((comm) => (
                  <TableRow key={comm.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-bold text-sm text-zinc-300">{comm.affiliate.name}</TableCell>
                    <TableCell className="text-sm text-zinc-300">{comm.gym.name}</TableCell>
                    <TableCell className="capitalize text-sm text-zinc-300">
                      {comm.type === 'setup' ? 'Setup Fee cut' : `Sub cut (Month ${comm.monthIndex})`}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-100">₦{comm.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={comm.status === 'paid' ? 'default' : 'secondary'} className={
                        comm.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
                      }>
                        {comm.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {comm.status === 'unpaid' ? (
                        <MarkPaidButton id={comm.id} />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Paid</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-500 italic">
                    No commissions found.
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
