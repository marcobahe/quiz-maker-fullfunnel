'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import ThemeProvider from '@/components/Layout/ThemeProvider';
import WorkspaceProvider from '@/components/Workspace/WorkspaceProvider';
import ImpersonationBanner from '@/components/Layout/ImpersonationBanner';
import AdminWorkspaceBanner from '@/components/Layout/AdminWorkspaceBanner';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <WorkspaceProvider>
          <ImpersonationBanner />
          <Suspense fallback={null}>
            <AdminWorkspaceBanner />
          </Suspense>
          {children}
        </WorkspaceProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
