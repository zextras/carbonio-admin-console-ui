/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

export const DOMAIN_GENERAL_VALIDATION_MESSAGES: Record<string, string> = {
  'domain.validation.invalid_email': 'Enter a valid email address.',
  'domain.validation.non_negative_integer': 'Enter a whole number of 0 or more',
};

function isValidEmailOrEmpty(value: string): boolean {
  if (value === '') return true;
  if (/\s/.test(value)) return false;
  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) return false;
  const domain = value.slice(atIndex + 1);
  const lastDotIndex = domain.lastIndexOf('.');
  return lastDotIndex > 0 && lastDotIndex < domain.length - 1;
}

function isNonNegativeIntegerOrEmpty(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

export const domainGeneralSettingsSchema = z.object({
  zimbraDomainStatus: z.string(),
  zimbraPublicServiceProtocol: z.string(),
  zimbraPublicServicePort: z.string(),
  zimbraPublicServiceHostname: z.string(),
  zimbraDNSCheckHostname: z.string(),
  zimbraPrefTimeZoneId: z.string(),
  zimbraNotes: z.string(),
  description: z.string(),
  zimbraHelpAdminURL: z.string(),
  zimbraHelpDelegatedURL: z.string(),
  zimbraDomainDefaultCOSId: z.string(),
  zimbraDomainMaxAccounts: z
    .string()
    .refine(isNonNegativeIntegerOrEmpty, {
      message: 'domain.validation.non_negative_integer',
    }),
  carbonioNotificationFrom: z
    .string()
    .refine(isValidEmailOrEmpty, { message: 'domain.validation.invalid_email' }),
  carbonioNotificationRecipients: z.array(z.object({ label: z.string() })),
  carbonioSearchSpecifiedDomainsByFeature: z.array(z.object({ label: z.string() })),
  domainQuotaGB: z
    .string()
    .refine(isNonNegativeIntegerOrEmpty, {
      message: 'domain.validation.non_negative_integer',
    }),
});

export type DomainGeneralSettingsFormValues = z.infer<typeof domainGeneralSettingsSchema>;
