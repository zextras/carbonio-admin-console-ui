/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

import { isValidIpRange } from '../../utility/utils';

const trustedIpSchema = z.string().refine(isValidIpRange, {
  message: 'error.one_or_more_ip_invalid',
});

const policyEntrySchema = z.object({
  trustedDevice: z.number().optional(),
  trustedIpRange: z.array(trustedIpSchema).optional(),
});

/**
 * Validation for the 2FA policies form. Applied form-level with
 * `validators: { onChange, onSubmit }`; zod assigns issues per service key so
 * they surface in `form.state.fieldMeta[service].errors` (trustedIpRange).
 */
export const twoFactorPoliciesSchema = z.record(z.string(), policyEntrySchema);

export type TwoFactorPoliciesFormValues = z.infer<typeof twoFactorPoliciesSchema>;
