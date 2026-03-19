'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { SubscriptionLockScreen } from './subscription-lock-screen';

interface GymContextType {
  gymSlug: string | null;
  gymData: any | null;
  isLoading: boolean;
}

const GymContext = createContext<GymContextType>({ 
  gymSlug: null, 
  gymData: null, 
  isLoading: true 
});

interface GymProviderProps {
  children: ReactNode;
  initialIsExpired?: boolean;
  initialGymStatus?: string;
  initialCurrentPlan?: string;
  userRole?: string;
}

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/setup'];

export function GymProvider({ 
  children, 
  initialIsExpired = false,
  initialGymStatus = 'active',
  initialCurrentPlan = 'starter',
  userRole = 'guest'
}: GymProviderProps) {
  const params = useParams();
  const pathname = usePathname();
  const [gymSlug, setGymSlug] = useState<string | null>(null);
  const [gymData, setGymData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(initialIsExpired);

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.includes(route));

  useEffect(() => {
    let slug = (params.subdomain || params.domain) as string;
    
    if (!slug && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('gympilotpro.com')) {
        slug = hostname.replace('.gympilotpro.com', '');
        if (slug === 'gympilotpro.com' || slug === 'www') slug = '';
      } else if (!hostname.includes('localhost')) {
        slug = hostname.startsWith('www.') ? hostname.replace('www.', '') : hostname;
      }
    }

    if (slug) {
      setGymSlug(slug);
      const fetchGymData = async () => {
        try {
          const response = await fetch(`/api/gyms/${slug}`);
          if (response.ok) {
            const data = await response.json();
            setGymData(data);
            
            // Re-verify expiration client-side
            if (data.subscriptions && data.subscriptions.length > 0) {
               const latestSub = data.subscriptions[0];
               const now = new Date();
               const endDate = new Date(latestSub.endDate);
               const expired = endDate < now || latestSub.status === 'expired';
               setIsExpired(expired);
            } else {
               setIsExpired(true);
            }

            if (data.primaryColor) {
              document.documentElement.style.setProperty('--primary-gym', data.primaryColor);
            }
            if (data.secondaryColor) {
              document.documentElement.style.setProperty('--secondary-gym', data.secondaryColor);
            }
          }
        } catch (error) {
          console.error('Failed to fetch gym data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGymData();
    } else {
      setIsLoading(false);
    }
  }, [params.subdomain, params.domain]);

  // Atomic check to prevent flashing
  if (!isPublicRoute && isExpired) {
    return (
      <SubscriptionLockScreen 
        role={userRole} 
        gymId={gymData?.id || ''} 
        gymStatus={gymData?.status || initialGymStatus}
        currentPlan={gymData?.subscriptions?.[0]?.plan || initialCurrentPlan}
        accent={gymData?.primaryColor || '#daa857'} 
      />
    );
  }

  return (
    <GymContext.Provider value={{ gymSlug, gymData, isLoading }}>
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => useContext(GymContext);
