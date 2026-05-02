import { getCurrentUser, getDashboardRedirectPath } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GetStartedForm from '@/components/get-started-form'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default async function GetStartedPage() {
  const user = await getCurrentUser()

  if (user) {
    const redirectPath = getDashboardRedirectPath(user)
    if (redirectPath) {
      redirect(redirectPath)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-black font-sans flex flex-col">
      <nav className="fixed top-0 w-full z-[100] bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 h-16 md:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black uppercase tracking-tighter">
              Insight<span className="text-orange-500">Gym</span>
            </span>
          </Link>
          <Link href="/" className="text-[11px] font-black tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
            BACK TO HOME
          </Link>
        </div>
      </nav>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 text-orange-500 animate-spin" /></div>}>
        <GetStartedForm />
      </Suspense>
    </div>
  )
}
