/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext, useContext } from 'react';

type CertificateContextValue = {
  isCertificateAvailable: boolean;
  domainId: string;
  domainName: string;
};

const CertificateContext = createContext<CertificateContextValue | null>(null);

export const CertificateContextProvider = CertificateContext.Provider;

export function useCertificateContext(): CertificateContextValue {
  const ctx = useContext(CertificateContext);
  if (!ctx) {
    throw new Error('useCertificateContext must be used within CertificateContextProvider');
  }
  return ctx;
}
