import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { LogOut, Copy, Users, DollarSign, CreditCard, ExternalLink, Activity } from 'lucide-react'
import CopyButton from './copy-button'

export const dynamic = 'force-dynamic'

export default async function AffiliateDashboard() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/affiliate/login')
  }

  // Find affiliate record linked to user
  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: user.id },
    include: {
      referrals: {
        include: {
          subscriptions: {
            orderBy: { endDate: 'desc' },
            take: 1
          }
        }
      },
      commissions: {
        include: {
          gym: true
        }
      }
    }
  })

  if (!affiliate) {
    redirect('/affiliate/signup')
  }

  // Calculations
  const referralsCount = affiliate.referrals.length

  const totalEarned = affiliate.commissions.reduce((acc, comm) => acc + comm.amount, 0)
  const totalPaid = affiliate.commissions
    .filter(comm => comm.status === 'paid')
    .reduce((acc, comm) => acc + comm.amount, 0)
  const totalOutstanding = totalEarned - totalPaid

  const shareLink = `https://gympilotpro.com/get-started?ref=${affiliate.referralCode}`

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-black uppercase tracking-tighter">
              Gympilot<span className="text-orange-500">pro</span> <span className="text-xs font-normal text-muted-foreground ml-1">AFFILIATE</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-muted-foreground hidden md:inline">
              Welcome, <span className="text-white">{affiliate.name}</span>
            </span>
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-white uppercase font-black text-xs tracking-wider gap-2">
              <Link href="/api/auth/logout">
                <LogOut className="w-4 h-4" /> Log Out
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10 space-y-10">

        {/* Referral Link & Stat Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code & Share Link Card */}
          <div className="bg-card border border-border p-6 rounded-none flex flex-col justify-between relative overflow-hidden lg:col-span-3">
            <div className="absolute inset-0 bg-orange-500/5 opacity-5 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase italic block mb-2">// Affiliate Link</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Share & Start Earning</h2>
                <p className="text-muted-foreground font-medium text-xs max-w-xl">
                  Referred gym owners get premium setup. You earn 20% setup cut + 20% subscription revenue for their first 6 months.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="bg-background border-2 border-border px-4 py-3 flex items-center justify-between font-black text-orange-500 tracking-wider">
                  <span>{affiliate.referralCode}</span>
                </div>
                <div className="flex gap-2">
                  <CopyButton text={shareLink} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border p-6 rounded-none relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">// Total Referrals</span>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-black text-white">{referralsCount}</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-none relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">// Total Earned</span>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-white">₦{totalEarned.toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-none relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">// Total Paid</span>
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-black text-white">₦{totalPaid.toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-none relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">// Outstanding Payout</span>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-black text-orange-500">₦{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        {/* Referrals & Commissions Tabs/Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Referrals List */}
          <div className="bg-card border border-border p-6 rounded-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <h3 className="font-black uppercase tracking-wider text-white italic">// Referred Gyms</h3>
                <span className="bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white uppercase">{referralsCount} Total</span>
              </div>

              {affiliate.referrals.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm font-bold uppercase tracking-wider">
                  No referrals yet. Share your link to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {affiliate.referrals.map((gym) => {
                    const latestSub = gym.subscriptions[0]
                    const now = new Date()
                    const isExpired = !latestSub || new Date(latestSub.endDate) < now || latestSub.status === 'expired'
                    const isPending = gym.status === 'pending'

                    let statusText = 'active'
                    let statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'

                    if (isPending) {
                      statusText = 'pending'
                      statusColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                    } else if (isExpired) {
                      statusText = 'inactive'
                      statusColor = 'text-red-500 bg-red-500/10 border-red-500/20'
                    }

                    return (
                      <div key={gym.id} className="border border-white/5 bg-white/[0.01] p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-white uppercase tracking-tight text-sm flex items-center gap-2">
                            {gym.name}
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 border ${statusColor}`}>
                              {statusText}
                            </span>
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">
                            Signed Up: {new Date(gym.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black uppercase text-orange-500 italic tracking-wider">
                            {latestSub?.plan || 'No Plan'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Commissions Breakdown */}
          <div className="bg-card border border-border p-6 rounded-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <h3 className="font-black uppercase tracking-wider text-white italic">// Commissions & Payouts</h3>
                <span className="bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white uppercase">₦{totalEarned.toLocaleString()} Total</span>
              </div>

              {affiliate.commissions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm font-bold uppercase tracking-wider">
                  No commissions generated yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {affiliate.commissions.map((comm) => (
                    <div key={comm.id} className="border border-white/5 bg-white/[0.01] p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-white uppercase tracking-tight text-xs">
                          {comm.gym.name}
                        </h4>
                        <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">
                          Type: {comm.type === 'setup' ? 'Setup Fee cut' : `Monthly Sub cut (Month ${comm.monthIndex})`}
                        </p>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest">
                          Date: {new Date(comm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-emerald-500">₦{comm.amount.toLocaleString()}</p>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 border ${comm.status === 'paid'
                            ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                            : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                          }`}>
                          {comm.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
