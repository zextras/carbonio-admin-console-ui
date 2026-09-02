/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { getUserTypeFromAttrs } from '../user-type-utils';

describe('getUserTypeFromAttrs', () => {
	it('returns DelegatedAdmin for a delegated admin account', () => {
		expect(getUserTypeFromAttrs({ zimbraIsDelegatedAdminAccount: 'TRUE' })).toBe('DelegatedAdmin');
	});

	it('returns System for a system admin account', () => {
		expect(getUserTypeFromAttrs({ zimbraIsSystemAdminAccount: 'TRUE' })).toBe('System');
	});

	it('returns Admin for a global admin account', () => {
		expect(getUserTypeFromAttrs({ zimbraIsAdminAccount: 'TRUE' })).toBe('Admin');
	});

	it('returns Normal when no admin flag is TRUE', () => {
		expect(getUserTypeFromAttrs({ zimbraIsAdminAccount: 'FALSE' })).toBe('Normal');
	});

	it('returns Normal for undefined attrs', () => {
		expect(getUserTypeFromAttrs(undefined)).toBe('Normal');
	});

	it('prefers DelegatedAdmin over System and Admin flags', () => {
		expect(
			getUserTypeFromAttrs({
				zimbraIsDelegatedAdminAccount: 'TRUE',
				zimbraIsSystemAdminAccount: 'TRUE',
				zimbraIsAdminAccount: 'TRUE',
			}),
		).toBe('DelegatedAdmin');
	});

	it('prefers System over the Admin flag', () => {
		expect(
			getUserTypeFromAttrs({ zimbraIsSystemAdminAccount: 'TRUE', zimbraIsAdminAccount: 'TRUE' }),
		).toBe('System');
	});

	it('ignores flags that are not the exact TRUE string', () => {
		expect(
			getUserTypeFromAttrs({
				zimbraIsDelegatedAdminAccount: 'true',
				zimbraIsSystemAdminAccount: 1,
				zimbraIsAdminAccount: 'TRUE',
			}),
		).toBe('Admin');
	});
});
