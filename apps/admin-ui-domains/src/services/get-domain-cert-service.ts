/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../constants';

export type DomainCertDetails = {
  subject?: string;
  SubjectAltName?: string;
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
};

type GetDomainCertSoapResponse = {
  cert?: Array<Record<string, Array<{ _content?: string }>>>;
};

function parseCertDetails(
  raw: Record<string, Array<{ _content?: string }>>,
): DomainCertDetails {
  const details: DomainCertDetails = {};
  Object.entries(raw).forEach(([key, value]) => {
    details[key as keyof DomainCertDetails] = value?.[0]?._content ?? '';
  });
  return details;
}

export async function getDomainCert(domainId: string): Promise<DomainCertDetails | null> {
  try {
    const response = await soapFetch<
      { _jsns: string; domain: string },
      GetDomainCertSoapResponse
    >('GetDomainCert', {
      _jsns: ZIMBRA_ADMIN_URN,
      domain: domainId,
    });
    const raw = response?.cert?.[0];
    if (!raw) return null;
    return parseCertDetails(raw);
  } catch {
    return null;
  }
}
