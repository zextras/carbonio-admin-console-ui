/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN, ZIMBRA_SSL_CERTIFICATE, ZIMBRA_SSL_PRIVATE_KEY } from '../constants';

export type DomainSslMaterial = {
  zimbraSSLCertificate?: string;
  zimbraSSLPrivateKey?: string;
};

type GetDomainSoapResponse = {
  domain?: Array<{
    a?: Array<{ n: string; _content?: string }>;
  }>;
};

export async function getDomainSslMaterial(domainName: string): Promise<DomainSslMaterial | null> {
  const response = await soapFetch<
    {
      _jsns: string;
      attrs: string;
      domain: { by: string; _content: string };
    },
    GetDomainSoapResponse
  >('GetDomain', {
    _jsns: ZIMBRA_ADMIN_URN,
    attrs: `${ZIMBRA_SSL_CERTIFICATE},${ZIMBRA_SSL_PRIVATE_KEY}`,
    domain: {
      by: 'name',
      _content: domainName,
    },
  });

  const attrs = response?.domain?.[0]?.a;
  if (!attrs) return null;

  const material: DomainSslMaterial = {};
  attrs.forEach((item) => {
    if (item.n === ZIMBRA_SSL_CERTIFICATE || item.n === ZIMBRA_SSL_PRIVATE_KEY) {
      material[item.n] = item._content ?? '';
    }
  });
  return material;
}
