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
      "z-[100] flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 font-sans overflow-y-auto",
      !isUpgradeMode && "fixed inset-0"
    )}>
      <div className="max-w-4xl w-full grid md:grid-cols-5 gap-0 border border-border bg-card rounded-[2.5rem] shadow-2xl overflow-hidden my-8">
        
        {/* Left Panel: Info & Selection */}
        <div className="md:col-span-3 p-4 md:p-8 space-y-8 relative">
          <div className="absolute inset-0 bg-[#daa857]/5 opacity-10 pointer-events-none" style={{ backgroundColor: `${accent}0D` }} />
          
          <div className="relative z-10">
            {isUpgradeMode && (
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="mb-4 text-muted-foreground hover:text-foreground focus:text-foreground uppercase text-[10px] font-black tracking-widest gap-2 p-0 h-auto"
              >
                <ChevronLeft size={14} /> Back
              </Button>
            )}
            <div className="h-16 w-16 bg-background rounded-2xl flex items-center justify-center mb-6 border border-border shadow-xl">
              {isUpgradeMode ? <CreditCard className="h-8 w-8" style={{ color: accent }} /> : <AlertCircle className="h-8 w-8 text-red-500" />}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-gray-200 uppercase tracking-tighter italic leading-none mb-4">
              {isUpgradeMode ? "Upgrade Your" : (isPending ? "Complete Your" : "Subscription")} <span className={cn(!isUpgradeMode && "text-red-500")} style={isUpgradeMode ? { color: accent } : {}}>{isUpgradeMode ? "Plan" : (isPending ? "Setup" : "Expired")}</span>
            </h1>
            
            <p className="text-muted-foreground font-medium leading-relaxed max-w-md">
              {isUpgradeMode 
                ? "Scale your gym with more members and premium features. Your remaining current plan balance will be applied as credit."
                : (isPending 
                  ? "Your gym account is created but pending payment. Unlock your dashboard to start managing your members."
                  : isAdmin 
                    ? "Your subscription has expired. Renew now to restore access for you and your members."
                    : "This gym’s subscription has expired. Please contact the gym administrator for assistance."
                )
              }
            </p>
          </div>

          {isAdmin && (
            <div className="space-y-6 relative z-10">
              {/* Plan Selection */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Choose Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(PLANS) as PlanKey[]).map((key) => {
                    const plan = PLANS[key];
                    const isCurrent = key === currentPlanKey;
                    const isSelected = key === selectedPlan;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedPlan(key)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group",
                          isSelected 
                            ? "bg-white/5 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                            : "bg-card/20 border-border hover:border-border"
                        )}
                        style={isSelected ? { borderColor: accent } : {}}
                      >
                        <p className={cn("text-xs font-black uppercase mb-1", isSelected ? "text-orange-500" : "text-muted-foreground")}
                           style={isSelected ? { color: accent } : {}}>
                          {plan.name}
                        </p>
                        <p className="text-sm font-bold text-muted-foreground">₦{plan.monthlyFee.toLocaleString()}</p>
                        {isCurrent && !isPending && (
                          <span className="absolute top-1 right-1 bg-white/10 text-[8px] px-1 rounded uppercase">Current</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Duration</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.months}
                      onClick={() => setSelectedMonths(d.months)}
                      className={cn(
                        "py-3 px-2 rounded-xl border-2 text-center transition-all",
                        selectedMonths === d.months 
                          ? "bg-white/5 border-orange-500" 
                          : "bg-card/20 border-border hover:border-border text-muted-foreground"
                      )}
                      style={selectedMonths === d.months ? { borderColor: accent } : {}}
                    >
                      <p className="text-xs font-black uppercase">{d.label}</p>
                      {d.discount > 0 && <p className="text-[8px] font-bold text-green-500">{(d.discount * 100)}% OFF</p>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Checkout */}
        <div className="md:col-span-2 bg-card/40 p-4 md:p-8 border-l border-border flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground text-xs font-bold uppercase">Plan</span>
                <span className="text-sm font-black uppercase italic">{PLANS[selectedPlan].name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground text-xs font-bold uppercase">Duration</span>
                <span className="text-sm font-black uppercase italic">{selectedMonths} Month(s)</span>
              </div>
              
              {pricing.setupFeeCharge > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground text-xs font-bold uppercase">{isPending ? "Setup Fee" : "Upgrade Fee"}</span>
                  <span className="text-sm font-black italic">₦{pricing.setupFeeCharge.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground text-xs font-bold uppercase">Monthly Fee</span>
                <span className="text-sm font-black italic">₦{pricing.monthlyTotal.toLocaleString()}</span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-green-500 text-[10px] font-black uppercase">Discount Applied</span>
                  <span className="text-green-500 text-sm font-black italic">-₦{pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}

              {isActuallyUpgrade && pricing.unusedCredit > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-green-500 text-[10px] font-black uppercase">Unused Credit Applied</span>
                  <span className="text-green-500 text-sm font-black italic">-₦{pricing.unusedCredit.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Payable</span>
              <span className="text-2xl md:text-4xl font-black italic text-orange-500" style={{ color: accent }}>
                ₦{pricing.total.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {isAdmin && (
                <Button 
                  onClick={handleRenew} 
                  disabled={loading}
                  className="w-full h-16 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#daa857]/10"
                  style={{ backgroundColor: accent }}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CreditCard className="h-5 w-5 mr-2" /> Pay with Paystack</>}
                </Button>
              )}
              
              {!isUpgradeMode && (
                <Button 
                  onClick={handleLogout} 
                  variant="outline"
                  className="w-full h-14 border-border bg-transparent hover:bg-white/5 text-muted-foreground font-black uppercase tracking-widest rounded-xl"
                >
                  <LogOut className="h-5 w-5 mr-2" /> Logout
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 opacity-30 grayscale contrast-200">
               <img src="https://paystack.com/assets/img/v3/common/paystack-logo.svg" alt="Paystack" className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
