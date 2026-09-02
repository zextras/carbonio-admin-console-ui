/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { getAccount } from '../get-account';

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	fetchAccount: vi.fn(),
}));

const { fetchAccount } = await import('@zextras/ui-shared');

describe('getAccount', () => {
	it('should look the account up by name through the shared service', async () => {
		vi.mocked(fetchAccount).mockResolvedValue({ account: [] });

		await getAccount('prefix_admin@test.com');

		expect(fetchAccount).toHaveBeenCalledWith('name', 'prefix_admin@test.com');
	});

	it('should return the first account on success', async () => {
		const account = { id: 'acc-1', name: 'prefix_admin@test.com', a: [] };
		vi.mocked(fetchAccount).mockResolvedValue({ account: [account] });

		const result = await getAccount('prefix_admin@test.com');

		expect(result).toEqual({ type: 'success', account });
	});

	it('should return a null account when none is present', async () => {
		vi.mocked(fetchAccount).mockResolvedValue({});

		const result = await getAccount('missing@test.com');

		expect(result).toEqual({ type: 'success', account: null });
	});

	it('should return error when the shared service rejects', async () => {
		vi.mocked(fetchAccount).mockRejectedValue(new Error('Not found'));

		const result = await getAccount('missing@test.com');

		expect(result).toEqual({ type: 'error', error: 'Not found' });
	});
});
