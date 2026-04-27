import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { SaaSNavigation } from './saas-navigation'

export default async function SaaSAdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'superadmin') {
    redirect('/saas-login')
  }

  return (
    <SaaSNavigation user={{ firstName: user.firstName, lastName: user.lastName, role: user.role }}>
      {children}
    </SaaSNavigation>
  )
}
