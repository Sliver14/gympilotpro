import { getCurrentUser, getAbsoluteRedirectPath } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SaaSLoginForm from '@/components/saas-login-form'

export default async function SaaSLoginPage() {
  const user = await getCurrentUser()

  if (user && user.role === 'superadmin') {
    const redirectUrl = getAbsoluteRedirectPath(user)
    if (redirectUrl) {
      redirect(redirectUrl)
    }
  }

  return <SaaSLoginForm />
}
