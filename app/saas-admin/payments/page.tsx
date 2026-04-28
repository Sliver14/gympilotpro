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
import { CreditCard, TrendingUp, Calendar } from 'lucide-react'

export default async function PaymentsPage() {
  const payments = await prisma.saaSPayment.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const thisMonthRevenue = payments
    .filter(p => {
      const date = new Date(p.createdAt)
      const now = new Date()
      return p.status === 'success' && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear()
    })
    .reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Platform Revenue</h1>
        <p className="text-zinc-400 mt-1">Monitor all SaaS subscription payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">₦{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Revenue This Month</CardTitle>
            <Calendar className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">₦{thisMonthRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Reference</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Plan</TableHead>
                <TableHead className="text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-mono text-xs text-zinc-500">{payment.reference}</TableCell>
                    <TableCell className="text-sm text-zinc-300">{payment.email}</TableCell>
                    <TableCell className="capitalize text-sm text-zinc-300">{payment.plan}</TableCell>
                    <TableCell className="font-medium text-zinc-100">₦{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'success' ? 'default' : 'secondary'} className={
                        payment.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
                      }>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-500 italic">
                    No transactions found.
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
