/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { filterMemberRows, pageRows, resolveNewMembers } from '../filter-members';

describe('filter-members', () => {
	describe('filterMemberRows', () => {
		it('filters by case-insensitive substring', () => {
			expect(
				filterMemberRows(['user1@example.com', 'admin@example.com', 'other.org'], 'ADMIN')
			).toEqual(['admin@example.com']);
		});

		it('returns everything for an empty filter', () => {
			expect(filterMemberRows(['a@example.com', 'b@example.com'], '')).toEqual([
				'a@example.com',
				'b@example.com'
			]);
		});
	});

	describe('pageRows', () => {
		it('slices rows by offset and limit', () => {
			expect(pageRows([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
		});

		it('returns an empty page past the end', () => {
			expect(pageRows([1, 2, 3], 10, 2)).toEqual([]);
		});
	});

	describe('resolveNewMembers', () => {
		it('rejects blank input', () => {
			expect(resolveNewMembers('', ['a@example.com'])).toEqual({ type: 'blank' });
		});

		it('rejects a plain invalid input', () => {
			expect(resolveNewMembers('not-an-email', [])).toEqual({ type: 'invalid' });
		});

		it('drops invalid fragments from multi-email inputs (original behavior)', () => {
			expect(resolveNewMembers('a@example.com, nope', [])).toEqual({
				type: 'ok',
				members: ['a@example.com']
			});
		});

		it('rejects when the raw input is already in the list', () => {
			expect(resolveNewMembers('a@example.com', ['a@example.com'])).toEqual({
				type: 'alreadyInList'
			});
		});

		it('resolves a single new email', () => {
			expect(resolveNewMembers('a@example.com', ['b@example.com'])).toEqual({
				type: 'ok',
				members: ['a@example.com']
			});
		});

		it('resolves a multi-email input to the extracted emails not yet in the list, in input order', () => {
			expect(
				resolveNewMembers('b@example.com a@example.com, c@example.com', ['c@example.com'])
			).toEqual({ type: 'ok', members: ['b@example.com', 'a@example.com'] });
		});

		it('resolves to an empty member list when every parsed email is already present', () => {
			// the raw multi-email string is not in the list, but each parsed email is
			expect(
				resolveNewMembers('a@example.com b@example.com', ['a@example.com', 'b@example.com'])
			).toEqual({ type: 'ok', members: [] });
		});
	});
});
