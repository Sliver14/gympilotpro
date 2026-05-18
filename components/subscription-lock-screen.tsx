'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, Loader2, LogOut, CreditCard, Check, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { PLANS, DURATIONS, calculatePrice, calculateUpgradePrice, PlanKey, PLAN_WEIGHTS } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

interface SubscriptionLockScreenProps {
  role: string
  gymId: string
  gymStatus?: string
  currentPlan?: string
  accent?: string
  isUpgradeMode?: boolean
}

export function SubscriptionLockScreen({ 
  role, 
  gymId, 
  gymStatus = 'active', 
  currentPlan = 'starter',
  accent = '#daa857',
  isUpgradeMode = false
}: SubscriptionLockScreenProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Normalized current plan key
  const currentPlanKey = (currentPlan?.toLowerCase() || 'starter') as PlanKey
  
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(currentPlanKey)
  const [selectedMonths, setSelectedMonths] = useState(1)
  
  const isAdmin = role === 'admin' || role === 'owner'
  const isPending = gymStatus === 'pending'

  const pricing = useMemo(() => {
    const currentWeight = PLAN_WEIGHTS[currentPlanKey] || 0;
    const newWeight = PLAN_WEIGHTS[selectedPlan] || 0;

    // Check if it's a real upgrade (higher tier and not just renewal)
    if (newWeight > currentWeight && !isPending) {
      const mockEndDate = new Date();
      mockEndDate.setDate(mockEndDate.getDate() + 15); // Mocking 15 days left for UI preview

      const upgrade = calculateUpgradePrice(currentPlanKey, selectedPlan, mockEndDate, selectedMonths);
      return {
        total: upgrade.total,
        setupFeeCharge: upgrade.setupFeeDiff,
        monthlyTotal: upgrade.newPlanTotal,
        discountAmount: 0,
        unusedCredit: upgrade.unusedCredit,
        daysRemaining: upgrade.daysRemaining
      };
    }

    const standard = calculatePrice(selectedPlan, selectedMonths, isPending, currentPlanKey);
    return {
      ...standard,
      unusedCredit: 0,
      daysRemaining: 0
    };
  }, [selectedPlan, selectedMonths, isPending, currentPlanKey])

  const isActuallyUpgrade = PLAN_WEIGHTS[selectedPlan] > (PLAN_WEIGHTS[currentPlanKey] || 0) && !isPending;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error(e)
    } finally {
      window.location.href = '/login'
    }
  }

  const handleRenew = async () => {
    setLoading(true)
    try {
      const resRenew = await fetch('/api/billing/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gymId,
          planKey: selectedPlan,
          months: selectedMonths
        })
      })
      const dataRenew = await resRenew.json()
      if (!resRenew.ok) throw new Error(dataRenew.error || 'Failed to initiate renewal')
      
      const { authorization_url } = dataRenew

      toast({ title: 'Redirecting', description: 'Taking you to Paystack secure checkout...' })

      if (authorization_url) {
        window.location.href = authorization_url
      } else {
        throw new Error('No payment URL received')
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Payment Failed', description: err.message || 'Please try again.', variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      "w-full bg-background text-foreground font-sans min-h-[100dvh] flex flex-col",
      !isUpgradeMode && "fixed inset-0 z-[100] overflow-y-auto"
    )}>
      <div className="flex-1 flex flex-col items-center justify-start p-2 md:p-8 lg:p-12 pb-24 md:pb-8">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 gap-0 border border-border bg-card rounded-[1rem] md:rounded-[2.5rem] shadow-2xl my-2 md:my-auto overflow-visible">
          
          {/* Left Panel: Info & Selection */}
          <div className="md:col-span-3 p-4 md:p-10 space-y-4 md:space-y-8 relative border-b md:border-b-0 md:border-r border-border rounded-t-[1rem] md:rounded-l-[2.5rem] md:rounded-tr-none overflow-hidden">
            <div className="absolute inset-0 bg-[#daa857]/5 opacity-10 pointer-events-none" style={{ backgroundColor: `${accent}0D` }} />
            
            <div className="relative z-10">
              {isUpgradeMode && (
                <Button 
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="mb-2 md:mb-4 text-muted-foreground hover:text-foreground focus:text-foreground text-[9px] md:text-[10px] font-black gap-2 p-0 h-auto uppercase tracking-wider"
                >
                  <ChevronLeft size={12} /> Back
                </Button>
              )}
              <div className="h-10 w-10 md:h-16 md:w-16 bg-background rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 border border-border shadow-xl">
                {isUpgradeMode ? <CreditCard className="h-5 w-5 md:h-8 md:w-8" style={{ color: accent }} /> : <AlertCircle className="h-5 w-5 md:h-8 md:w-8 text-red-500" />}
              </div>
              
              <h1 className="text-xl md:text-5xl font-black text-gray-200 uppercase tracking-tighter leading-tight mb-2">
                {isUpgradeMode ? "Upgrade" : (isPending ? "Complete" : "Subscription")} <span className={cn(!isUpgradeMode && "text-red-500")} style={isUpgradeMode ? { color: accent } : {}}>{isUpgradeMode ? "Plan" : (isPending ? "Setup" : "Expired")}</span>
              </h1>
              
              <p className="text-muted-foreground font-medium leading-relaxed max-w-md text-[10px] md:text-base">
                {isUpgradeMode 
                  ? "Scale your gym with premium features. Current balance applied as credit."
                  : (isPending 
                    ? "Complete payment to unlock your dashboard."
                    : isAdmin 
                      ? "Subscription expired. Renew to restore access."
                      : "Subscription expired. Contact gym admin."
                  )
                }
              </p>
            </div>

            {isAdmin && (
              <div className="space-y-4 md:space-y-8 relative z-10">
                {/* Plan Selection */}
                <div>
                  <label className="text-[8px] md:text-[9px] font-black text-muted-foreground mb-2 block uppercase tracking-widest">Select Plan</label>
                  <div className="grid grid-cols-3 gap-1.5 md:gap-3">
                    {(Object.keys(PLANS) as PlanKey[]).map((key) => {
                      const plan = PLANS[key];
                      const isCurrent = key === currentPlanKey;
                      const isSelected = key === selectedPlan;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedPlan(key)}
                          className={cn(
                            "p-2 md:p-5 rounded-lg md:rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                            isSelected 
                              ? "bg-white/5 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                              : "bg-card/20 border-border hover:border-border/50"
                          )}
                          style={isSelected ? { borderColor: accent } : {}}
                        >
                          <p className={cn("text-[7px] md:text-[9px] font-black mb-0.5 uppercase tracking-wider", isSelected ? "text-orange-500" : "text-muted-foreground")}
                             style={isSelected ? { color: accent } : {}}>
                            {plan.name}
                          </p>
                          <p className="text-[10px] md:text-lg font-black text-foreground">₦{plan.monthlyFee.toLocaleString()}</p>
                          {isCurrent && !isPending && (
                            <span className="absolute top-0.5 right-0.5 bg-white/10 text-[6px] font-bold px-0.5 rounded uppercase tracking-tighter scale-75 md:scale-100">Current</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-[8px] md:text-[9px] font-black text-muted-foreground mb-2 block uppercase tracking-widest">Select Duration</label>
                  <div className="grid grid-cols-4 gap-1.5 md:gap-3">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.months}
                        onClick={() => setSelectedMonths(d.months)}
                        className={cn(
                          "py-2 md:py-4 px-1 rounded-lg md:rounded-2xl border-2 text-center transition-all",
                          selectedMonths === d.months 
                            ? "bg-white/5 border-orange-500" 
                            : "bg-card/20 border-border hover:border-border/50 text-muted-foreground"
                        )}
                        style={selectedMonths === d.months ? { borderColor: accent } : {}}
                      >
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-wider">{d.label.split(' ')[0]}</p>
                        {d.discount > 0 && <p className="text-[6px] md:text-[8px] font-black text-green-500 mt-0.5 uppercase tracking-tighter">{(d.discount * 100)}% OFF</p>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Checkout */}
          <div className="md:col-span-2 bg-card/40 p-4 md:p-10 flex flex-col justify-between">
            <div className="space-y-4 md:space-y-8">
              <h3 className="text-sm md:text-xl font-black uppercase tracking-widest">Summary</h3>
              
              <div className="space-y-2 md:space-y-4 text-[10px] md:text-sm">
                <div className="flex justify-between items-center py-2 md:py-4 border-b border-border/50">
                  <span className="text-muted-foreground font-black uppercase tracking-wider">Plan</span>
                  <span className="font-black">{PLANS[selectedPlan].name}</span>
                </div>
                <div className="flex justify-between items-center py-2 md:py-4 border-b border-border/50">
                  <span className="text-muted-foreground font-black uppercase tracking-wider">Duration</span>
                  <span className="font-black">{selectedMonths} Mo.</span>
                </div>
                
                {pricing.setupFeeCharge > 0 && (
                  <div className="flex justify-between items-center py-2 md:py-4 border-b border-border/50">
                    <span className="text-muted-foreground font-black uppercase tracking-wider">{isPending ? "Setup" : "Upgrade"}</span>
                    <span className="font-black">₦{pricing.setupFeeCharge.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 md:py-4 border-b border-border/50">
                  <span className="text-muted-foreground font-black uppercase tracking-wider">Rate</span>
                  <span className="font-black">₦{pricing.monthlyTotal.toLocaleString()}</span>
                </div>

                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between items-center py-2 md:py-4 border-b border-border/50">
                    <span className="text-green-500 font-black uppercase tracking-wider">Discount</span>
                    <span className="text-green-500 font-black">-₦{pricing.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {isActuallyUpgrade && pricing.unusedCredit > 0 && (
                  <div className="flex justify-between items-center py-2 md:py-4 border-b border-border/50">
                    <span className="text-green-500 font-black uppercase tracking-wider">Credit</span>
                    <span className="text-green-500 font-black">-₦{pricing.unusedCredit.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-12 space-y-4 md:space-y-8">
              <div className="flex justify-between items-end">
                <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                <span className="text-xl md:text-4xl font-black text-orange-500" style={{ color: accent }}>
                  ₦{pricing.total.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-2 md:gap-4">
                {isAdmin && (
                  <Button 
                    onClick={handleRenew} 
                    disabled={loading}
                    className="w-full h-12 md:h-16 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black rounded-lg md:rounded-2xl transition-all shadow-xl shadow-[#daa857]/10 text-xs md:text-base uppercase tracking-widest"
                    style={{ backgroundColor: accent }}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4 mr-2 md:mr-3" /> Checkout</>}
                  </Button>
                )}
                
                {!isUpgradeMode && (
                  <Button 
                    onClick={handleLogout} 
                    variant="outline"
                    className="w-full h-10 md:h-14 border-border bg-transparent hover:bg-white/5 text-muted-foreground font-black rounded-lg md:rounded-2xl uppercase tracking-widest text-[8px] md:text-xs"
                  >
                    <LogOut className="h-3 w-3 mr-2" /> Sign Out
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2 opacity-30 grayscale contrast-200 pt-1">
                 <img src="https://paystack.com/assets/img/v3/common/paystack-logo.svg" alt="Paystack" className="h-2.5 md:h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
