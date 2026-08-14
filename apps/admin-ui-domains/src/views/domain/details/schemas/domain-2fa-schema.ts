/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

import { isValidIpRange } from '../../../utility/utils';

export type TwoFactorPolicyFormValue = {
	service: string;
	trustedDevice: number;
	trustedIpRange: string[];
};

export type TwoFactorFormValues = {
	policies: TwoFactorPolicyFormValue[];
};

export const DOMAIN_2FA_VALIDATION_MESSAGES: Record<string, string> = {
	'2fa.invalid_ip_range': 'Enter a valid IP range (e.g., 192.168.1.0/24)'
};

export const twoFactorSchema = z
	.object({
		policies: z.array(
			z.object({
				service: z.string(),
				trustedDevice: z.number(),
				trustedIpRange: z.array(z.string())
			})
		)
	})
	.superRefine((val, ctx) => {
		val.policies.forEach((policy, policyIndex) => {
			policy.trustedIpRange.forEach((ip, ipIndex) => {
				if (ip && !isValidIpRange(ip)) {
					ctx.addIssue({
						code: 'custom',
						path: ['policies', policyIndex, 'trustedIpRange', ipIndex],
						message: '2fa.invalid_ip_range'
					});
				}
			});
		});
	});
