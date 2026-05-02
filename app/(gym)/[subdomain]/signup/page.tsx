import { getCurrentUser, getDashboardRedirectPath } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GymSignupForm from '@/components/gym-signup-form'

export default async function SignupPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = await params
  const user = await getCurrentUser()

  if (user) {
    // If it's a superadmin, redirect to saas dashboard
    if (user.role === 'superadmin') {
      redirect('/saas-admin/dashboard')
    }

    // Comprehensive check: match by slug OR custom domain
    const userGym = user.gym;
    const currentIdentifier = subdomain.toLowerCase();
    
    const isMatchedGym = 
      userGym?.slug.toLowerCase() === currentIdentifier || 
      userGym?.customDomain?.toLowerCase() === currentIdentifier ||
      (userGym?.customDomain && `www.${userGym.customDomain.toLowerCase()}` === currentIdentifier);

    if (isMatchedGym) {
      const redirectPath = getDashboardRedirectPath(user)
      if (redirectPath) {
        redirect(redirectPath)
      }
    }
  }

  return <GymSignupForm />
}
