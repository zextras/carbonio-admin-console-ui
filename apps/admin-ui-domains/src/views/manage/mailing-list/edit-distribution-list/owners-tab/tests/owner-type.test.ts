/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resolveOwnerType, sortOwnersByName } from '../owner-type';

describe('owner-type', () => {
	describe('resolveOwnerType', () => {
		it('defaults to email', () => {
			expect(resolveOwnerType([], 'someone@example.com')).toBe('email');
		});

		it('maps a group contact to grp', () => {
			expect(
				resolveOwnerType(
					[{ id: 'gal-1', type: 'group', email: 'list@example.com', name: 'list@example.com' }],
					'list@example.com'
				)
			).toBe('grp');
		});

		it('maps a non-group contact to usr', () => {
			expect(
				resolveOwnerType(
					[{ id: 'gal-2', type: 'account', email: 'user@example.com', name: 'User' }],
					'user@example.com'
				)
			).toBe('usr');
		});

		it('ignores sources without id, type, or matching email', () => {
			expect(
				resolveOwnerType(
					[
						{ type: 'group', email: 'a@example.com' },
						{ id: 'x', email: 'b@example.com' },
						{ id: 'y', type: 'group', email: 'c@example.com' }
					],
					'a@example.com'
				)
			).toBe('email');
		});
	});

	describe('sortOwnersByName', () => {
		it('sorts case-insensitively by name', () => {
			expect(
				sortOwnersByName([
					{ name: 'zeta@example.com' },
					{ name: 'Alpha@example.com' },
					{ name: 'mid@example.com' }
				]).map((owner) => owner.name)
			).toEqual(['Alpha@example.com', 'mid@example.com', 'zeta@example.com']);
		});

		it('does not mutate the input array', () => {
			const input = [{ name: 'b' }, { name: 'a' }];
			sortOwnersByName(input);
			expect(input.map((owner) => owner.name)).toEqual(['b', 'a']);
		});
	});
});
