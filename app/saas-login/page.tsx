import { getCurrentUser, getDashboardRedirectPath } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SaaSLoginForm from '@/components/saas-login-form'

export default async function SaaSLoginPage() {
  const user = await getCurrentUser()

  if (user) {
    const redirectPath = getDashboardRedirectPath(user)
    if (redirectPath) {
      redirect(redirectPath)
    }
  }

  return <SaaSLoginForm />
}
