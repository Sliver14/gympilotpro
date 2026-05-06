import { getCurrentUser, getAbsoluteRedirectPath } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SaaSLandingClient from '@/components/saas-landing-client'

export default async function SaaSLandingPage() {
  const user = await getCurrentUser()

  if (user) {
    const redirectUrl = getAbsoluteRedirectPath(user)
    if (redirectUrl) {
      redirect(redirectUrl)
    }
  }

  return <SaaSLandingClient />
}
