import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SubscriptionBannerProps {
  daysUntilExpiry?: number
  isExpired: boolean
  isGracePeriod: boolean
  accent?: string
}

export function SubscriptionBanner({ daysUntilExpiry, isExpired, isGracePeriod, accent = '#daa857' }: SubscriptionBannerProps) {
  if (!isExpired && !isGracePeriod && (daysUntilExpiry === undefined || daysUntilExpiry > 7)) return null

  const isCritical = isExpired && !isGracePeriod
  
  return (
    <div className={`w-full z-[100] border-b px-4 py-3 flex items-center justify-center gap-4 ${isCritical ? 'bg-red-500 text-white border-red-600' : 'bg-[#daa857]/10 border-[#daa857]/20 text-[#daa857]'}`}>
      <AlertTriangle className={`h-5 w-5 ${isCritical ? 'text-foreground' : 'text-[#daa857]'}`} />
      
      <div className="text-sm font-bold flex-1 text-center md:text-left">
        {isCritical ? (
          <span className="uppercase tracking-widest">Action Required: Your SaaS plan has expired. Please renew to avoid service interruption for your members.</span>
        ) : isGracePeriod ? (
          <span className="uppercase tracking-widest">Grace Period Active: Your SaaS plan has expired. Service will be disconnected in {daysUntilExpiry} days.</span>
        ) : (
          <span className="uppercase tracking-widest">Warning: Your SaaS plan will expire in {daysUntilExpiry} days.</span>
        )}
      </div>

      <Link href="/admin/billing" className="hidden md:block">
        <Button 
          size="sm" 
          variant={isCritical ? 'secondary' : 'default'}
          className={`font-black uppercase tracking-widest text-[10px] ${!isCritical && 'bg-[#daa857] text-black hover:bg-[#cdb48b]'}`}
        >
          Renew Plan <ArrowRight className="ml-2 h-3 w-3" />
        </Button>
      </Link>
    </div>
  )
}
