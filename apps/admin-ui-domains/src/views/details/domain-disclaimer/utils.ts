/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { encode } from 'html-entities';

import {
  AMAVIS_DISCLAIMER_OPTIONS,
  FALSE,
  TRUE,
  ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
  ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
  ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
} from '../../../constants';

export type DomainDisclaimerFormValues = {
  zimbraDomainMandatoryMailSignatureEnabled: boolean;
  zimbraAmavisDomainDisclaimerText: string;
  zimbraAmavisDomainDisclaimerHTML: string;
};

type DomainAttribute = { n: string; _content?: string };

// RFC 5321 caps a line at 998 bytes including the newline (1 byte), so at most
// 997 content chars fit per line before wrapping.
const LONG_LINE_REGEX = /(.{997})/g;

function wrapLongLines(content: string): string {
  return content.replace(LONG_LINE_REGEX, '$1\n');
}

export function normalizeDisclaimerText(text: string): string {
  const withoutDiacritics = text.normalize('NFD').replaceAll(/\p{Diacritic}/gu, "'");
  return wrapLongLines(withoutDiacritics);
}

export function encodeDisclaimerHtml(html: string): string {
  return wrapLongLines(encode(html, { mode: 'nonAsciiPrintableOnly' }));
}

export function buildDisclaimerDomainAttributes(
  values: DomainDisclaimerFormValues,
  domainName: string | undefined,
): Array<{ n: string; _content: string }> {
  return [
    {
      n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
      _content: values.zimbraAmavisDomainDisclaimerText
        ? normalizeDisclaimerText(values.zimbraAmavisDomainDisclaimerText)
        : '',
    },
    {
      n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
      _content: values.zimbraAmavisDomainDisclaimerHTML
        ? encodeDisclaimerHtml(values.zimbraAmavisDomainDisclaimerHTML)
        : '',
    },
    {
      n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
      _content: values.zimbraDomainMandatoryMailSignatureEnabled ? TRUE : FALSE,
    },
    {
      n: AMAVIS_DISCLAIMER_OPTIONS,
      _content: values.zimbraDomainMandatoryMailSignatureEnabled ? domainName ?? '' : '',
    },
  ];
}

export function getDefaultDisclaimerFormValues(
  domainInformation: Array<DomainAttribute> | undefined,
): DomainDisclaimerFormValues {
  const attrMap: Record<string, string> = {};
  domainInformation?.forEach((item) => {
    if (!attrMap[item.n]) {
      attrMap[item.n] = item._content ?? '';
    }
  });
  return {
    zimbraDomainMandatoryMailSignatureEnabled:
      attrMap[ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED] === TRUE,
    zimbraAmavisDomainDisclaimerText: attrMap[ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT] ?? '',
    zimbraAmavisDomainDisclaimerHTML: attrMap[ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML] ?? '',
  };
}
