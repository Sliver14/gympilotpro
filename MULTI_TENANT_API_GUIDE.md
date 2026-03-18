# Multi-Tenant Refactoring Guide

## 1. Migration Steps

To execute the database migration without losing data:

1. **Phase 1: Apply Optional `gymId` Schema**
   Run the following command to create the new tables (`Gym`, `Device`, `GymSubscription`) and add `gymId` as a nullable field to existing tables:
   ```bash
   npx prisma generate
   npx prisma db push
   # Or using migrations: npx prisma migrate dev --name init_multi_tenant
   ```

2. **Phase 2: Run Data Migration Script**
   Run the provided seed script to create the default gym and assign all existing data to it:
   ```bash
   npx ts-node scripts/migrate-to-multitenant.ts
   ```

3. **Phase 3: Enforce Non-Null Constraint**
   Update `prisma/schema.prisma` to make `gymId` strictly required (change `String?` back to `String` where appropriate) to avoid future un-assigned records.
   ```bash
   npx prisma migrate dev --name enforce_gym_id
   ```

---

## 2. Updated API Examples (Backend Queries)

All Prisma database queries must be scoped to the `gymId` to ensure strict tenant data isolation.

### A. Example API Route Update (`app/api/[gymSlug]/members/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGymFromRequest } from '@/lib/gym-context';

export async function GET(request: NextRequest, { params }: { params: { gymSlug: string } }) {
  try {
    const gym = await getGymFromRequest(request);
    
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    // Refactored Query: Enforce gymId scope
    const members = await prisma.user.findMany({
      where: {
        gymId: gym.id,
        role: 'member',
        deletedAt: null,
      },
      include: {
        memberProfile: {
          include: { membership: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
```

### B. Refactored Queries Patterns
**Old Form (Single Tenant):**
```typescript
await prisma.attendance.create({ data: { userId, checkInTime: new Date() } });
await prisma.payment.findMany({ where: { status: 'approved' } });
await prisma.user.count({ where: { role: 'member' } });
```

**New Form (Multi-Tenant):**
```typescript
await prisma.attendance.create({ 
  data: { gymId: currentGym.id, userId, checkInTime: new Date() } 
});

await prisma.payment.findMany({ 
  where: { gymId: currentGym.id, status: 'approved' } 
});

await prisma.user.count({ 
  where: { gymId: currentGym.id, role: 'member' } 
});
```

---

## 3. Frontend API Adjustments

The frontend needs to know which gym it is currently operating under to send the correct API requests.

### A. Global Gym Context Provider
Create a React Context to wrap the application and provide the `gymSlug` to all components.

```tsx
// components/GymProvider.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'next/navigation';

const GymContext = createContext<{ gymSlug: string | null }>({ gymSlug: null });

export function GymProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const gymSlug = (params.gymSlug as string) || 'klimarx'; // Default fallback

  return (
    <GymContext.Provider value={{ gymSlug }}>
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => useContext(GymContext);
```

### B. Updating Frontend API Calls
Update `fetch` or `axios` calls to include the `gymSlug` in the route path dynamically.

**Old Example:**
```typescript
const response = await fetch('/api/members');
```

**New Refactored Example:**
```typescript
import { useGym } from '@/components/GymProvider';

export function MemberList() {
  const { gymSlug } = useGym();
  
  const loadMembers = async () => {
    // Dynamic routing with gym slug included
    const response = await fetch(`/api/${gymSlug}/members`);
    const data = await response.json();
    return data;
  };
  
  // ...
}
```

By ensuring the URL path strictly dictates the `gymSlug` for both frontend components and backend API endpoints, all operations remain fully isolated and secure across multiple gym tenants.
