'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import ThemeProvider from '@/components/Layout/ThemeProvider';
import ImpersonationBanner from '@/components/Layout/ImpersonationBanner';
import AdminWorkspaceBanner from '@/components/Layout/AdminWorkspaceBanner';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ImpersonationBanner />
        <Suspense fallback={null}>
          <AdminWorkspaceBanner />
        </Suspense>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
