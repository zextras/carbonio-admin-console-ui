/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { getBackupAccounts } from '../get-backup-accounts';

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	getBackupAccounts: vi.fn(),
}));

const { getBackupAccounts: fetchBackupAccounts } = await import('@zextras/ui-shared');

const params = {
	domain: 'test.com',
	filter: 'admin',
	legalHold: false,
	page: 0,
	pageSize: 10,
};

describe('getBackupAccounts', () => {
	it('should forward the params to the shared backup accounts service', async () => {
		vi.mocked(fetchBackupAccounts).mockResolvedValue({ accounts: [], maxPage: 0 });

		await getBackupAccounts(params);

		expect(fetchBackupAccounts).toHaveBeenCalledWith({
			page: 0,
			pageSize: 10,
			domains: 'test.com',
			filter: 'admin',
			legalHold: false,
		});
	});

	it('should return success with parsed accounts', async () => {
		const accounts = [
			{
				id: 'acc-1',
				name: 'admin@test.com',
				status: 'active',
				legalHold: 'false',
				serverName: 'mailstore1.test.com',
				creationTimestamp: 1,
			},
		];
		vi.mocked(fetchBackupAccounts).mockResolvedValue({ accounts, maxPage: 2 });

		const result = await getBackupAccounts(params);

		expect(result).toEqual({ type: 'success', accounts, maxPage: 2 });
	});

	it('should return error when all_server contains an error message', async () => {
		vi.mocked(fetchBackupAccounts).mockResolvedValue({
			accounts: [],
			maxPage: 0,
			allServerError: 'Backup unavailable',
		});

		const result = await getBackupAccounts(params);

		expect(result).toEqual({ type: 'error', error: 'Backup unavailable' });
	});

	it('should return error when the shared service rejects', async () => {
		vi.mocked(fetchBackupAccounts).mockRejectedValue(new Error('Network error'));

		const result = await getBackupAccounts(params);

		expect(result).toEqual({ type: 'error', error: 'Network error' });
	});
});
