/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const COS_VALIDATION_MESSAGES: Record<string, string> = {
  'cos.validation.non_negative_integer': 'Enter a whole number of 0 or more',
  'cos.validation.percent_range': 'Enter a whole number between 0 and 100',
  'cos.validation.invalid_duration': 'Enter a whole number of 0 or more',
  'cos.validation.max_less_than_min_length':
    'Maximum length must be greater than or equal to the minimum length',
  'cos.validation.max_less_than_min_age':
    'Maximum age must be greater than or equal to the minimum age',
};

// Form values are string-encoded; empty means "inherit / no limit" and is always valid.
function isNonNegativeInteger(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

function isPercent(value: string): boolean {
  return value === '' || (/^\d+$/.test(value) && Number(value) <= 100);
}

// Composite time fields store "<digits><unit>" (e.g. "7d"); validate the numeric portion.
function isDuration(value: string): boolean {
  return value === '' || /^\d+[smhd]?$/.test(value);
}

function isComparableInteger(value: unknown): value is string {
  return typeof value === 'string' && /^\d+$/.test(value);
}

const optionalNonNegativeInt = z
  .string()
  .refine(isNonNegativeInteger, { message: 'cos.validation.non_negative_integer' })
  .optional();

const optionalPercent = z
  .string()
  .refine(isPercent, { message: 'cos.validation.percent_range' })
  .optional();

const optionalDuration = z
  .string()
  .refine(isDuration, { message: 'cos.validation.invalid_duration' })
  .optional();

export const cosAdvancedSchema = z
  .object({
    // Required by the form-value type; not validated beyond their boolean shape.
    backupEnabled: z.boolean(),
    backupSelfUndeleteAllowed: z.boolean(),
    // Forwarding
    zimbraMailForwardingAddressMaxLength: optionalNonNegativeInt,
    zimbraMailForwardingAddressMaxNumAddrs: optionalNonNegativeInt,
    // Password
    zimbraPasswordMinLength: optionalNonNegativeInt,
    zimbraPasswordMaxLength: optionalNonNegativeInt,
    zimbraPasswordMinUpperCaseChars: optionalNonNegativeInt,
    zimbraPasswordMinLowerCaseChars: optionalNonNegativeInt,
    zimbraPasswordMinPunctuationChars: optionalNonNegativeInt,
    zimbraPasswordMinNumericChars: optionalNonNegativeInt,
    zimbraPasswordMinDigitsOrPuncs: optionalNonNegativeInt,
    zimbraPasswordMinAge: optionalNonNegativeInt,
    zimbraPasswordMaxAge: optionalNonNegativeInt,
    zimbraPasswordEnforceHistory: optionalNonNegativeInt,
    // Quotas
    zimbraMailQuota: optionalNonNegativeInt,
    zimbraContactMaxNumEntries: optionalNonNegativeInt,
    zimbraQuotaWarnPercent: optionalPercent,
    zimbraQuotaWarnInterval: optionalDuration,
    // Failed login policy
    zimbraPasswordLockoutMaxFailures: optionalNonNegativeInt,
    zimbraPasswordLockoutDuration: optionalDuration,
    zimbraPasswordLockoutFailureLifetime: optionalDuration,
    // Timeout policy
    zimbraAdminAuthTokenLifetime: optionalDuration,
    zimbraAuthTokenLifetime: optionalDuration,
    zimbraMailIdleSessionTimeout: optionalDuration,
    // Email retention policy
    zimbraMailMessageLifetime: optionalDuration,
    zimbraMailTrashLifetime: optionalDuration,
    zimbraMailSpamLifetime: optionalDuration,
  })
  .refine(
    (data) =>
      !isComparableInteger(data.zimbraPasswordMaxLength) ||
      !isComparableInteger(data.zimbraPasswordMinLength),
  )
  .refine(
    (data) =>
      !isComparableInteger(data.zimbraPasswordMaxAge) ||
      !isComparableInteger(data.zimbraPasswordMinAge),
  );
