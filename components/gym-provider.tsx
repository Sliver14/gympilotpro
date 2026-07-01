'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useParams, usePathname } from 'next/navigation';
import { SubscriptionLockScreen } from './subscription-lock-screen';

type BranchSelection = string | 'all' | null;

interface GymContextType {
  gymSlug: string | null;
  gymData: any | null;
  isLoading: boolean;
  tenantPath: (path: string) => string;

  // Branch support
  activeBranchId: BranchSelection;
  setActiveBranchId: (branchId: BranchSelection) => void;
  selectedBranch: BranchSelection;
  setSelectedBranch: (branchId: BranchSelection) => void;
  currentBranch: any | null;
}

const GymContext = createContext<GymContextType>({
  gymSlug: null,
  gymData: null,
  isLoading: true,
  tenantPath: (path: string) => path,

  activeBranchId: 'all',
  setActiveBranchId: () => {},
  selectedBranch: 'all',
  setSelectedBranch: () => {},
  currentBranch: null,
});

interface GymProviderProps {
  children: ReactNode;
  initialIsExpired?: boolean;
  initialGymStatus?: string;
  initialCurrentPlan?: string;
  initialGymId?: string;
  initialAccent?: string;
  userRole?: string;
}

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/setup',
];

export function GymProvider({
  children,
  initialIsExpired = false,
  initialGymStatus = 'active',
  initialCurrentPlan = 'starter',
  initialGymId = '',
  initialAccent = '#daa857',
  userRole = 'guest',
}: GymProviderProps) {
  const params = useParams();
  const pathname = usePathname();

  const [gymSlug, setGymSlug] = useState<string | null>(null);
  const [gymData, setGymData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(initialIsExpired);
  const [currentRole, setCurrentRole] = useState(userRole);
  const [isUserChecking, setIsUserChecking] = useState(userRole === 'guest');

  // Branch state
  const [selectedBranch, setSelectedBranchState] = useState<BranchSelection>('all');

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname?.includes(route)
  );

  // Sync prop changes
  useEffect(() => {
    setCurrentRole(userRole);
    setIsUserChecking(userRole === 'guest');
  }, [userRole]);

  // Fetch authenticated user
  useEffect(() => {
    if (userRole === 'guest') {
      const fetchUser = async () => {
        try {
          const res = await fetch('/api/auth/user');

          if (res.ok) {
            const data = await res.json();

            if (data.role) {
              setCurrentRole(data.role);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        } finally {
          setIsUserChecking(false);
        }
      };

      fetchUser();
    } else {
      setIsUserChecking(false);
    }
  }, [userRole]);

  // Tenant-aware URLs
  const tenantPath = useCallback(
    (path: string) => {
      if (typeof window === 'undefined') return path;

      const hostname = window.location.hostname;
      const ROOT_DOMAIN = 'gympilotpro.com';

      const isRoot =
        hostname === ROOT_DOMAIN ||
        hostname === `www.${ROOT_DOMAIN}` ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.vercel.app');

      let resolved = path;
      if (isRoot && gymSlug) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        resolved = `/${gymSlug}${cleanPath}`;
      }

      // Preserve branch search param if it exists in current URL
      const searchParams = new URLSearchParams(window.location.search);
      const branch = searchParams.get('branch');
      if (branch) {
        try {
          const urlObj = new URL(resolved, window.location.origin);
          urlObj.searchParams.set('branch', branch);
          resolved = urlObj.pathname + urlObj.search + urlObj.hash;
        } catch (e) {
          const separator = resolved.includes('?') ? '&' : '?';
          resolved = `${resolved}${separator}branch=${encodeURIComponent(branch)}`;
        }
      }

      return resolved;
    },
    [gymSlug]
  );

  // Load gym
  useEffect(() => {
    let slug = (params.subdomain || params.domain) as string;

    if (!slug && typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname.includes('gympilotpro.com')) {
        slug = hostname.replace('.gympilotpro.com', '');

        if (slug === 'gympilotpro.com' || slug === 'www') {
          slug = '';
        }
      } else if (!hostname.includes('localhost')) {
        slug = hostname.startsWith('www.')
          ? hostname.replace('www.', '')
          : hostname;
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

            // Verify subscription
            if (data.subscriptions?.length > 0) {
              const latest = data.subscriptions[0];

              const expired =
                new Date(latest.endDate) < new Date() ||
                latest.status === 'expired';

              setIsExpired(expired);
            } else {
              setIsExpired(true);
            }

            // Theme
            if (data.primaryColor) {
              document.documentElement.style.setProperty(
                '--primary-gym',
                data.primaryColor
              );
              document.documentElement.style.setProperty(
                '--primary',
                data.primaryColor
              );
              document.documentElement.style.setProperty(
                '--ring',
                data.primaryColor
              );
            }

            if (data.secondaryColor) {
              document.documentElement.style.setProperty(
                '--secondary-gym',
                data.secondaryColor
              );
              document.documentElement.style.setProperty(
                '--secondary',
                data.secondaryColor
              );
            }
          }
        } catch (error) {
          console.error('Failed to fetch gym:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchGymData();
    } else {
      setIsLoading(false);
    }
  }, [params.subdomain, params.domain]);

  // Restore selected branch
  useEffect(() => {
    if (!gymData?.id) return;

    const isElite = gymData.subscriptions?.[0]?.plan === 'elite';
    if (!isElite) {
      setSelectedBranchState(null);
      return;
    }

    const branchesList = gymData.branches || [];
    if (branchesList.length === 1) {
      setSelectedBranchState(branchesList[0].id);
      return;
    }

    const saved = localStorage.getItem(`branch_${gymData.id}`);

    if (saved) {
      setSelectedBranchState(saved as BranchSelection);
    } else {
      setSelectedBranchState('all');
    }
  }, [gymData]);

  const setSelectedBranch = useCallback((branchId: BranchSelection) => {
    const isElite = gymData?.subscriptions?.[0]?.plan === 'elite';
    if (!isElite) {
      setSelectedBranchState(null);
      return;
    }

    const branchesList = gymData?.branches || [];
    if (branchesList.length === 1) {
      setSelectedBranchState(branchesList[0].id);
      return;
    }

    setSelectedBranchState(branchId);

    if (gymData?.id) {
      localStorage.setItem(
        `branch_${gymData.id}`,
        branchId ?? 'all'
      );
    }
  }, [gymData]);

  const activeBranchId = selectedBranch;
  const setActiveBranchId = setSelectedBranch;

  const currentBranch =
    gymData?.branches?.find(
      (branch: any) => branch.id === selectedBranch
    ) ?? null;

  // Subscription lock
  if (!isPublicRoute && isExpired) {
    if (isUserChecking) {
      return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#daa857] border-t-transparent" />
        </div>
      );
    }

    return (
      <SubscriptionLockScreen
        role={currentRole}
        gymId={gymData?.id || initialGymId}
        gymStatus={gymData?.status || initialGymStatus}
        currentPlan={
          gymData?.subscriptions?.[0]?.plan || initialCurrentPlan
        }
        accent={gymData?.primaryColor || initialAccent}
      />
    );
  }

  return (
    <GymContext.Provider
      value={{
        gymSlug,
        gymData,
        isLoading,
        tenantPath,

        activeBranchId,
        setActiveBranchId,
        selectedBranch,
        setSelectedBranch,
        currentBranch,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => useContext(GymContext);