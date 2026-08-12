/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isEqual, map, reduce, split, trim } from 'lodash-es';

import { IpRangeValue, MtaServerGeneral } from '../../../../../../types';
import {
  CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
  FALSE,
  TRUE,
  ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
  ZIMBRA_AMAVIS_LOG_LEVEL,
  ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
  ZIMBRA_AMAVIS_SA_LOG_LEVEL,
  ZIMBRA_MTA_FALLBACK_RELAY_HOST,
  ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
  ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
} from '../../../../../constants';

type ServerAttr = { n: string; _content: string };

export const LOGGING_ATTR_KEYS = [
  ZIMBRA_AMAVIS_LOG_LEVEL,
  ZIMBRA_AMAVIS_SA_LOG_LEVEL,
  ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
  ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
] as const;

export const ANTIVIRUS_ATTR_KEYS = [
  ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
  ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
  CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
  ZIMBRA_MTA_FALLBACK_RELAY_HOST,
] as const;

export function findAttrContent(
  attributes: Array<ServerAttr>,
  key: string,
): string | undefined {
  return attributes.find((item) => item?.n === key)?._content;
}

export function parseNetworkLabels(
  content: string | undefined,
  separator: string | RegExp = ' ',
): Array<IpRangeValue> {
  return content?.trim()
    ? map(split(content, separator), (ip) => ({ label: trim(ip) }))
    : [];
}

export function authEnabledFromContent(content: string | undefined): string | undefined {
  if (!content) return undefined;
  return content === 'yes' ? TRUE : FALSE;
}

export function applyPresentAttrs(
  attributes: Array<ServerAttr>,
  keys: ReadonlyArray<string>,
  setFn: (key: string, value: string) => void,
): void {
  keys.forEach((key) => {
    const content = findAttrContent(attributes, key);
    if (content) {
      setFn(key, content);
    }
  });
}

function getValues(val: string | undefined): string {
  if (val === undefined) return '';
  return val || '';
}

function getYesNoValues(val: string | undefined): string {
  if (val === undefined) return '';
  return val === TRUE ? 'yes' : 'no';
}

export function buildModifiedAttributes(
  detail: MtaServerGeneral | undefined,
  initial: MtaServerGeneral | undefined,
): Array<Record<string, string>> {
  const modifiedKeys: Array<keyof MtaServerGeneral> = reduce(
    detail ?? ({} as MtaServerGeneral),
    (result: Array<keyof MtaServerGeneral>, value, key: string): Array<keyof MtaServerGeneral> => {
      const k = key as keyof MtaServerGeneral;
      return isEqual(value, initial?.[k]) ? result : [...result, k];
    },
    [] as Array<keyof MtaServerGeneral>,
  );

  const attributes: Array<Record<string, string>> = [];
  if (modifiedKeys.length > 0 && detail) {
    modifiedKeys.forEach((key: keyof MtaServerGeneral) => {
      if (key === ZIMBRA_MTA_SASL_AUTH_ENABLED) {
        attributes.push({ n: key, _content: getYesNoValues(detail[key]) });
      } else {
        attributes.push({ n: key, _content: getValues(detail[key]) });
      }
    });
  }
  return attributes;
}
