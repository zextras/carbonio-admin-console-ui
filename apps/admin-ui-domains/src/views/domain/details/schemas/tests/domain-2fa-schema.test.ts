/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { type TwoFactorFormValues,twoFactorSchema } from '../domain-2fa-schema';

describe('twoFactorSchema', () => {
	describe('valid inputs', () => {
		it('accepts empty policies array', () => {
			const input: TwoFactorFormValues = { policies: [] };
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it('accepts policy with empty trustedIpRange', () => {
			const input: TwoFactorFormValues = {
				policies: [{ service: 'WebUI', trustedDevice: 1, trustedIpRange: [] }]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it('accepts valid IP address', () => {
			const input: TwoFactorFormValues = {
				policies: [{ service: 'WebUI', trustedDevice: 1, trustedIpRange: ['192.168.1.1'] }]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it('accepts valid IP range with CIDR notation', () => {
			const input: TwoFactorFormValues = {
				policies: [{ service: 'WebUI', trustedDevice: 1, trustedIpRange: ['192.168.1.0/24'] }]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it('accepts multiple valid IP ranges', () => {
			const input: TwoFactorFormValues = {
				policies: [
					{
						service: 'WebUI',
						trustedDevice: 1,
						trustedIpRange: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
					}
				]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it('accepts multiple policies with valid IP ranges', () => {
			const input: TwoFactorFormValues = {
				policies: [
					{ service: 'WebUI', trustedDevice: 1, trustedIpRange: ['192.168.1.0/24'] },
					{ service: 'MobileApp', trustedDevice: 0, trustedIpRange: ['10.0.0.1'] }
				]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});
	});

	describe('invalid inputs', () => {
		it('rejects invalid IP address format', () => {
			const input: TwoFactorFormValues = {
				policies: [{ service: 'WebUI', trustedDevice: 1, trustedIpRange: ['invalid-ip'] }]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toEqual(['policies', 0, 'trustedIpRange', 0]);
				expect(result.error.issues[0].message).toBe('2fa.invalid_ip_range');
			}
		});

		it('rejects IP range with invalid CIDR', () => {
			const input: TwoFactorFormValues = {
				policies: [{ service: 'WebUI', trustedDevice: 1, trustedIpRange: ['192.168.1.0/33'] }]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it('reports correct path for second invalid IP in array', () => {
			const input: TwoFactorFormValues = {
				policies: [
					{
						service: 'WebUI',
						trustedDevice: 1,
						trustedIpRange: ['192.168.1.1', 'bad-ip']
					}
				]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toEqual(['policies', 0, 'trustedIpRange', 1]);
			}
		});

		it('reports correct path for invalid IP in second policy', () => {
			const input: TwoFactorFormValues = {
				policies: [
					{ service: 'WebUI', trustedDevice: 1, trustedIpRange: ['192.168.1.1'] },
					{ service: 'MobileApp', trustedDevice: 0, trustedIpRange: ['not-an-ip'] }
				]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toEqual(['policies', 1, 'trustedIpRange', 0]);
			}
		});

		it('reports multiple errors for multiple invalid IPs', () => {
			const input: TwoFactorFormValues = {
				policies: [
					{
						service: 'WebUI',
						trustedDevice: 1,
						trustedIpRange: ['bad1', 'bad2']
					}
				]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(2);
			}
		});
	});

	describe('edge cases', () => {
		it('allows empty string in trustedIpRange (skipped by validation)', () => {
			const input: TwoFactorFormValues = {
				policies: [{ service: 'WebUI', trustedDevice: 1, trustedIpRange: [''] }]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it('accepts boundary CIDR values /0 and /32', () => {
			const input: TwoFactorFormValues = {
				policies: [
					{
						service: 'WebUI',
						trustedDevice: 1,
						trustedIpRange: ['0.0.0.0/0', '192.168.1.1/32']
					}
				]
			};
			const result = twoFactorSchema.safeParse(input);
			expect(result.success).toBe(true);
		});
	});
});
