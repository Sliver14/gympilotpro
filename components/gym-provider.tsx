'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

export function GymProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  // In the new architecture, gymSlug is either in params (internal) or derived from host
  const [gymSlug, setGymSlug] = useState<string | null>(null);
  const [gymData, setGymData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Try to get from params (for internal routing / Rewrites)
    let slug = (params.subdomain || params.domain) as string;
    
    // 2. If not in params, try to derive from hostname
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
            
            // Apply dynamic branding colors to CSS variables
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

  return (
    <GymContext.Provider value={{ gymSlug, gymData, isLoading }}>
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => useContext(GymContext);
