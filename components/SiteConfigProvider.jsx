'use client';

import { createContext, useContext } from 'react';
import { resolveVisibility } from '@/lib/pages';

// Public, non-secret site configuration needed by client components
// (menus, job links). Filled once in app/layout.js from site_settings.
const DEFAULT_VALUE = {
  visibility: resolveVisibility({}),
  adGate: { enabled: false, maxPerSession: 0 },
};

const SiteConfigContext = createContext(DEFAULT_VALUE);

export function SiteConfigProvider({ value, children }) {
  return <SiteConfigContext.Provider value={value || DEFAULT_VALUE}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
