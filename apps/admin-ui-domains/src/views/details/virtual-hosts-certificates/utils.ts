/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ZIMBRA_DOMAIN_NAME, ZIMBRA_ID, ZIMBRA_VIRTUAL_HOSTNAME } from '../../../constants';
import type { VirtualHostItem, VirtualHostsFormValues } from './schema';

export function getDomainAttrValues(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
  attrName: string,
): Array<string> {
  if (!domainInformation?.length) return [];
  return domainInformation
    .filter((item) => item.n === attrName)
    .map((item) => item._content ?? '')
    .filter((value) => value !== '');
}

export function getFirstDomainAttr(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
  attrName: string,
): string {
  return getDomainAttrValues(domainInformation, attrName)[0] ?? '';
}

export function getDefaultVirtualHosts(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): Array<VirtualHostItem> {
  return getDomainAttrValues(domainInformation, ZIMBRA_VIRTUAL_HOSTNAME).map((hostname, index) => ({
    id: String(index + 1),
    hostname,
  }));
}

export function getDefaultVirtualHostsFormValues(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): VirtualHostsFormValues {
  return { hosts: getDefaultVirtualHosts(domainInformation) };
}

export function getZimbraId(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): string {
  return getFirstDomainAttr(domainInformation, ZIMBRA_ID);
}

export function getDomainNameFromAttrs(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): string {
  return getFirstDomainAttr(domainInformation, ZIMBRA_DOMAIN_NAME);
}

export function buildVirtualHostAttributes(
  hosts: Array<VirtualHostItem>,
): Array<{ n: string; _content: string }> {
  if (hosts.length === 0) {
    return [{ n: ZIMBRA_VIRTUAL_HOSTNAME, _content: '' }];
  }
  return hosts.map((host) => ({
    n: ZIMBRA_VIRTUAL_HOSTNAME,
    _content: host.hostname,
  }));
}
