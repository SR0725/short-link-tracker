"use client";

import { Suspense } from 'react';
import { I18nProvider } from '@/lib/i18n/context';

interface ProvidersProps {
  children: React.ReactNode;
}

function I18nProviderSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <I18nProvider>
        {children}
      </I18nProvider>
    </Suspense>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProviderSuspense>
      {children}
    </I18nProviderSuspense>
  );
}