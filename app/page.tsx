import { getCurrentUser, getDashboardRedirectPath } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SaaSLandingClient from '@/components/saas-landing-client'

export default async function SaaSLandingPage() {
  const user = await getCurrentUser()

  if (user) {
    const redirectPath = getDashboardRedirectPath(user)
    
    if (redirectPath) {
      // If gym user on root domain, redirect to their subdomain
      if (user.role !== 'superadmin' && user.gym?.slug) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'gympilotpro.com';
        const port = process.env.NODE_ENV === 'production' ? '' : ':3000';
        
        // Check if user has a custom domain
        const host = user.gym.customDomain || `${user.gym.slug}.${domain}`;
        redirect(`${protocol}://${host}${port}${redirectPath}`);
      }
      
      // Otherwise (superadmin), use normal relative redirect
      redirect(redirectPath)
    }
  }

  return <SaaSLandingClient />
}
