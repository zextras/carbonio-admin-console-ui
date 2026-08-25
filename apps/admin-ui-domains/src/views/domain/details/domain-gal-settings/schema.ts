/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

export const GAL_VALIDATION_MESSAGES: Record<string, string> = {
  'gal.validation.non_negative_integer': 'Enter a whole number of 0 or more',
};

function isNonNegativeIntegerOrEmpty(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

export const domainGalSettingsSchema = z.object({
  zimbraGalMode: z.string(),
  zimbraGalMaxResults: z
    .string()
    .refine(isNonNegativeIntegerOrEmpty, {
      message: 'gal.validation.non_negative_integer',
    }),
  zimbraGalLdapPageSize: z
    .string()
    .refine(isNonNegativeIntegerOrEmpty, {
      message: 'gal.validation.non_negative_integer',
    }),
  zimbraGalLdapURL: z.string(),
  zimbraGalLdapStartTlsEnabled: z.string(),
  zimbraGalLdapFilter: z.string(),
  zimbraGalLdapSearchBase: z.string(),
  zimbraGalLdapBindDn: z.string(),
  zimbraGalLdapBindPassword: z.string(),
  zimbraGalLdapAuthMech: z.string(),
  freqDigits: z.string(),
  freqUnit: z.string(),
});

export type DomainGalSettingsFormValues = z.infer<typeof domainGalSettingsSchema>;
