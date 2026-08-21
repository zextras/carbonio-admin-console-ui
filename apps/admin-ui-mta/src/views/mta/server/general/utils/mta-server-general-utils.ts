/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isEqual, map, reduce, split, trim } from 'lodash-es';

import { IpRangeValue } from '../../../../../../types';
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
  ZIMBRA_MTA_MY_NETWORKS,
  ZIMBRA_MTA_RELAY_HOST,
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
  ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
} from '../../../../../constants';
import type { MtaServerGeneralFormValues, ServerAttr } from '../types';

export const AUTHENTICATION_ATTR_KEYS = [
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
  ZIMBRA_MTA_MY_NETWORKS,
  ZIMBRA_MTA_RELAY_HOST,
  ZIMBRA_MTA_FALLBACK_RELAY_HOST,
] as const;

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
  detail: MtaServerGeneralFormValues | undefined,
  initial: MtaServerGeneralFormValues | undefined,
): Array<Record<string, string>> {
  const modifiedKeys: Array<keyof MtaServerGeneralFormValues> = reduce(
    detail ?? ({} as MtaServerGeneralFormValues),
    (
      result: Array<keyof MtaServerGeneralFormValues>,
      value,
      key: string,
    ): Array<keyof MtaServerGeneralFormValues> => {
      const k = key as keyof MtaServerGeneralFormValues;
      return isEqual(value, initial?.[k]) ? result : [...result, k];
    },
    [] as Array<keyof MtaServerGeneralFormValues>,
  );

  const attributes: Array<Record<string, string>> = [];
  if (modifiedKeys.length > 0 && detail) {
    modifiedKeys.forEach((key: keyof MtaServerGeneralFormValues) => {
      if (key === ZIMBRA_MTA_SASL_AUTH_ENABLED) {
        attributes.push({ n: key, _content: getYesNoValues(detail[key]) });
      } else {
        attributes.push({ n: key, _content: getValues(detail[key]) });
      }
    });
  }
  return attributes;
}

export function buildInitialState(
  serverAttributes: Array<ServerAttr>,
): MtaServerGeneralFormValues {
  return {
    zimbraMtaSaslAuthEnable: authEnabledFromContent(
      findAttrContent(serverAttributes, ZIMBRA_MTA_SASL_AUTH_ENABLED),
    ),
    zimbraMtaMyNetworks: findAttrContent(serverAttributes, ZIMBRA_MTA_MY_NETWORKS),
    zimbraMtaRelayHost: findAttrContent(serverAttributes, ZIMBRA_MTA_RELAY_HOST),
    zimbraMtaFallbackRelayHost: findAttrContent(
      serverAttributes,
      ZIMBRA_MTA_FALLBACK_RELAY_HOST,
    ),
    zimbraAmavisOriginatingBypassSA: findAttrContent(
      serverAttributes,
      ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
    ),
    zimbraAmavisEnableDKIMVerification: findAttrContent(
      serverAttributes,
      ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
    ),
    carbonioAmavisDisableVirusCheck: findAttrContent(
      serverAttributes,
      CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
    ),
    zimbraAmavisLogLevel: findAttrContent(serverAttributes, ZIMBRA_AMAVIS_LOG_LEVEL),
    zimbraAmavisSALogLevel: findAttrContent(serverAttributes, ZIMBRA_AMAVIS_SA_LOG_LEVEL),
    zimbraMtaSmtpdTlsLoglevel: findAttrContent(serverAttributes, ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL),
    zimbraMtaLmtpTlsLoglevel: findAttrContent(serverAttributes, ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL),
  };
}

export function buildServerSpecificState(
  serverSpecificAttributes: Array<ServerAttr>,
): MtaServerGeneralFormValues {
  return {
    zimbraMtaSaslAuthEnable: authEnabledFromContent(
      findAttrContent(serverSpecificAttributes, ZIMBRA_MTA_SASL_AUTH_ENABLED),
    ),
    zimbraMtaMyNetworks: findAttrContent(serverSpecificAttributes, ZIMBRA_MTA_MY_NETWORKS),
    zimbraMtaRelayHost: findAttrContent(serverSpecificAttributes, ZIMBRA_MTA_RELAY_HOST),
    zimbraMtaFallbackRelayHost: findAttrContent(
      serverSpecificAttributes,
      ZIMBRA_MTA_FALLBACK_RELAY_HOST,
    ),
    zimbraAmavisOriginatingBypassSA: findAttrContent(
      serverSpecificAttributes,
      ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
    ),
    zimbraAmavisEnableDKIMVerification: findAttrContent(
      serverSpecificAttributes,
      ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
    ),
    carbonioAmavisDisableVirusCheck: findAttrContent(
      serverSpecificAttributes,
      CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
    ),
    zimbraAmavisLogLevel: findAttrContent(serverSpecificAttributes, ZIMBRA_AMAVIS_LOG_LEVEL),
    zimbraAmavisSALogLevel: findAttrContent(serverSpecificAttributes, ZIMBRA_AMAVIS_SA_LOG_LEVEL),
    zimbraMtaSmtpdTlsLoglevel: findAttrContent(
      serverSpecificAttributes,
      ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
    ),
    zimbraMtaLmtpTlsLoglevel: findAttrContent(
      serverSpecificAttributes,
      ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
    ),
  };
}
