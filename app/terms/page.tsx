import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 md:py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/" className="group flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full border-2 border-orange-500/50 flex items-center justify-center p-1 bg-zinc-900 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Service <span className="text-orange-500">Terms</span></h1>
          </Link>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Version 1.0 • Effective May 6, 2026</p>
        </div>

        <div className="space-y-8 bg-zinc-900/30 border border-white/5 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-sm">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Deployment & Usage</h2>
            <p className="text-sm leading-relaxed">
              By activating a GymPilotPro trial or subscription, you agree to deploy the platform exclusively for lawful gym management purposes. Unauthorized extraction of data or subversion of terminal security is strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">2. Tenant Responsibilities</h2>
            <p className="text-sm leading-relaxed">
              Gym owners (Tenants) are responsible for the accuracy of the membership data they input and for maintaining the confidentiality of their administrative credentials. GymPilotPro is not liable for data breaches resulting from tenant-side credential negligence.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Subscription & Billing</h2>
            <p className="text-sm leading-relaxed">
              Access to the platform is granted on a subscription basis. Failure to maintain an active plan will result in "Terminal Lock," disabling member check-ins and automated reminders until the account is rectified.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">4. System Uptime</h2>
            <p className="text-sm leading-relaxed">
              While we strive for 99.9% availability, GymPilotPro does not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance via the Admin Dashboard.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">5. Termination</h2>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">5. Termination</h2>
            <p className="text-sm leading-relaxed">
              GymPilotPro reserves the right to terminate access for any tenant found in violation of these terms or engaged in activities that compromise the integrity of the SaaS ecosystem.
            </p>
          </section>
        </div>

        <div className="flex justify-center">
          <Button asChild variant="ghost" className="text-zinc-500 hover:text-white font-black text-[10px] uppercase tracking-widest">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Command Center
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
