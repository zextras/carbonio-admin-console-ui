/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN, ZIMBRA_PUBLIC_SERVICE_HOSTNAME } from '../constants';

type GetDomainSoapResponse = {
  domain?: Array<{
    a?: Array<{ n: string; _content?: string }>;
  }>;
};

export async function getDomainPublicServiceHostname(
  domainName: string,
): Promise<string | undefined> {
  const response = await soapFetch<
    {
      _jsns: string;
      attrs: string;
      domain: { by: string; _content: string };
    },
    GetDomainSoapResponse
  >('GetDomain', {
    _jsns: ZIMBRA_ADMIN_URN,
    attrs: ZIMBRA_PUBLIC_SERVICE_HOSTNAME,
    domain: {
      by: 'name',
      _content: domainName,
    },
  });

  const hostname = response?.domain?.[0]?.a?.find(
    (attr) => attr.n === ZIMBRA_PUBLIC_SERVICE_HOSTNAME,
  )?._content;
  return hostname || undefined;
}
