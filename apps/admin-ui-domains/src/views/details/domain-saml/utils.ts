/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ZIMBRA_PUBLIC_SERVICE_HOSTNAME, ZIMBRA_PUBLIC_SERVICE_PROTOCOL } from '../../../constants';
import { getServiceUrl, getSPEntityId } from '../../utility/utils';

export type SamlAttribute = { attribute: string; value: unknown };

export type SpEndpoints = { entityId: string; serviceUrl: string };

type DomainAttribute = { n: string; _content?: string };

export function getSamlAttributes(
  samlConfig: Record<string, unknown> | undefined,
): Array<SamlAttribute> {
  if (!samlConfig) {
    return [];
  }
  return Object.entries(samlConfig).map(([attribute, value]) => ({ attribute, value }));
}

export function getDomainAttributeValue(
  domainInformation: Array<DomainAttribute> | undefined,
  name: string,
): string {
  return domainInformation?.find((item) => item.n === name)?._content ?? '';
}

export function getSpEndpoints(
  domainInformation: Array<DomainAttribute> | undefined,
  domainName: string,
): SpEndpoints {
  const protocol = getDomainAttributeValue(domainInformation, ZIMBRA_PUBLIC_SERVICE_PROTOCOL);
  const hostname = getDomainAttributeValue(domainInformation, ZIMBRA_PUBLIC_SERVICE_HOSTNAME);
  return {
    entityId: getSPEntityId(protocol, hostname, domainName),
    serviceUrl: getServiceUrl(protocol, hostname),
  };
}
