/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const COS_VALIDATION_MESSAGES: Record<string, string> = {
  'cos.validation.non_negative_integer': 'Enter a whole number of 0 or more',
  'cos.validation.invalid_duration': 'Enter a whole number of 0 or more',
};

// Form values are string-encoded; empty means "inherit / no limit" and is always valid.
function isNonNegativeInteger(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

// Composite time fields store "<digits><unit>" (e.g. "7d"); validate the numeric portion.
function isDuration(value: string): boolean {
  return value === '' || /^\d+[smhd]?$/.test(value);
}

const optionalNonNegativeInt = z
  .string()
  .refine(isNonNegativeInteger, { message: 'cos.validation.non_negative_integer' })
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
    zimbraContactMaxNumEntries: optionalNonNegativeInt,
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
  });
