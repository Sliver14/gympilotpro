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
import { PhoneCall, Calendar, Users, Building2 } from 'lucide-react'

export default async function SaaSLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <PhoneCall className="w-5 h-5 text-pink-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight text-white">Demo Leads</h1>
        </div>
        <p className="text-zinc-400">Manage and track all gym owners who requested a demo.</p>
      </div>

      <Card className="shadow-sm bg-zinc-950/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-zinc-100 text-white">All Inquiries ({leads.length})</CardTitle>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black">
            HIGH INTENT
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Gym Information</TableHead>
                <TableHead className="text-zinc-400">Scale</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-right text-zinc-400">Request Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="border-zinc-800 hover:bg-zinc-900/50 group">
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-white uppercase tracking-tight italic text-lg group-hover:text-orange-500 transition-colors">
                          {lead.gymName}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                          <PhoneCall size={12} />
                          {lead.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-zinc-500" />
                        <span className="text-sm font-bold text-zinc-300">{lead.memberCount} Members</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 uppercase text-[10px] font-black tracking-widest">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-zinc-300">
                          {new Date(lead.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">
                          {new Date(lead.createdAt).toLocaleTimeString(undefined, { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-zinc-500">
                      <Building2 size={40} className="opacity-20" />
                      <p className="italic">No demo leads captured yet.</p>
                    </div>
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
