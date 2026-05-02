import { getCurrentUser, getDashboardRedirectPath } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SaaSLandingClient from '@/components/saas-landing-client'

export default async function SaaSLandingPage() {
  const user = await getCurrentUser()

  if (user) {
    const redirectPath = getDashboardRedirectPath(user)
    if (redirectPath) {
      redirect(redirectPath)
    }
  }

  return <SaaSLandingClient />
}
