/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

export const CREATE_DOMAIN_VALIDATION_MESSAGES: Record<string, string> = {
  'domain.validation.domain_name_required': 'Domain name is required',
  'domain.validation.domain_name_invalid': 'Domain name cannot contain spaces or "@"',
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

function hasValidDomainNameFormat(value: string): boolean {
  return !/\s/.test(value) && !value.includes('@');
}

const selectItemSchema = z.object({ label: z.string(), value: z.string() });

export const createDomainSchema = z
  .object({
    domainName: z.string(),
    zimbraDomainMaxAccounts: z
      .string()
      .refine(isNonNegativeIntegerOrEmpty, {
        message: 'domain.validation.non_negative_integer',
      }),
    domainQuotaGB: z
      .string()
      .refine(isNonNegativeIntegerOrEmpty, {
        message: 'domain.validation.non_negative_integer',
      }),
    description: z.string(),
    zimbraNotes: z.string(),
    galSyncAccountName: z.string(),
    dataSourceName: z.string(),
    mailServer: selectItemSchema.optional(),
    zimbraDomainDefaultCOSId: z.string(),
    isDomainDelegatedAdmin: z.boolean(),
    carbonioNotificationFrom: z
      .string()
      .refine(isValidEmailOrEmpty, { message: 'domain.validation.invalid_email' }),
    carbonioNotificationRecipients: z
      .array(z.object({ label: z.string() }))
      .refine(
        (recipients) => recipients.every((recipient) => isValidEmailOrEmpty(recipient.label)),
        { message: 'domain.validation.invalid_email' },
      ),
  })
  .superRefine((values, ctx) => {
    if (values.domainName.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['domainName'],
        message: 'domain.validation.domain_name_required',
      });
    } else if (!hasValidDomainNameFormat(values.domainName)) {
      ctx.addIssue({
        code: 'custom',
        path: ['domainName'],
        message: 'domain.validation.domain_name_invalid',
      });
    }
  });

export type CreateDomainSchemaValues = z.infer<typeof createDomainSchema>;
