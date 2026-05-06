import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 md:py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/" className="group flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full border-2 border-orange-500/50 flex items-center justify-center p-1 bg-zinc-900 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Privacy <span className="text-orange-500">Protocol</span></h1>
          </Link>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Version 1.0 • Effective May 6, 2026</p>
        </div>

        <div className="space-y-8 bg-zinc-900/30 border border-white/5 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-sm">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Data Ingestion</h2>
            <p className="text-sm leading-relaxed">
              GymPilotPro collects essential data points required to maintain the structural integrity of your gym's operations. This includes personal identifiers (names, emails, phone numbers) for members and staff, as well as membership performance metrics.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">2. Use of Information</h2>
            <p className="text-sm leading-relaxed">
              Information is utilized strictly for service delivery: automated WhatsApp reminders, check-in validation, and billing analytics. We do not sell user data to third-party entities. All data is processed to optimize gym revenue and member experience.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Security Infrastructure</h2>
            <p className="text-sm leading-relaxed">
              Data is housed in encrypted environments. We employ industry-standard protocols to prevent unauthorized access, maintaining the "Sanctuary" status of every gym tenant on the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Cookies & Tracking</h2>
            <p className="text-sm leading-relaxed">
              We utilize essential cookies to maintain session persistence and enhance terminal responsiveness. Analytical cookies are used to understand platform usage and drive continuous improvement of the SaaS engine.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">5. User Autonomy</h2>
            <p className="text-sm leading-relaxed">
              Users retain the right to access, rectify, or request the deletion of their personal data through the gym management or direct communication with GymPilotPro support.
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
