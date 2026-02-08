'use client';

import { SessionProvider } from 'next-auth/react';
import ThemeProvider from '@/components/Layout/ThemeProvider';
import ImpersonationBanner from '@/components/Layout/ImpersonationBanner';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ImpersonationBanner />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
