/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import {
	doRestoreOnNewAccount,
	getBackupAccounts,
	parseBackupAccountsResponse,
} from '../backup-account-service';

vi.mock('../../network/fetch', () => ({
	fetchExternalSoap: vi.fn(),
	getSoapFetchRequest: vi.fn(),
}));

const { fetchExternalSoap, getSoapFetchRequest } = await import('../../network/fetch');

describe('parseBackupAccountsResponse', () => {
	it('passes through a single-server response', () => {
		const accounts = [{ name: 'a@example.com' }];
		expect(parseBackupAccountsResponse({ accounts, maxPage: 3 })).toEqual({
			accounts,
			maxPage: 3,
		});
	});

	it('merges accounts of a multiserver response and takes the highest maxPage', () => {
		const result = parseBackupAccountsResponse({
			server1: { response: { accounts: [{ name: 'a@example.com' }], maxPage: 2 } },
			server2: { response: { accounts: [{ name: 'b@example.com' }], maxPage: 5 } },
		});

		expect(result.accounts).toEqual([
			{ name: 'a@example.com' },
			{ name: 'b@example.com' },
		]);
		expect(result.maxPage).toBe(5);
	});

	it('returns an empty list for an empty response', () => {
		expect(parseBackupAccountsResponse({})).toEqual({ accounts: [], maxPage: 0 });
	});
});

describe('getBackupAccounts', () => {
	it('fetches the backup accounts endpoint without legalHold by default', async () => {
		vi.mocked(getSoapFetchRequest).mockResolvedValue({ accounts: [], maxPage: 0 });

		await getBackupAccounts({ page: 1, pageSize: 10, domains: 'example.com', filter: 'exa' });

		expect(getSoapFetchRequest).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/backup/getBackupAccounts?page=1&pageSize=10&domains=example.com&filter=exa',
		);
	});

	it('appends the legalHold flag when provided', async () => {
		vi.mocked(getSoapFetchRequest).mockResolvedValue({ accounts: [], maxPage: 0 });

		await getBackupAccounts({
			page: 0,
			pageSize: 50,
			domains: 'example.com',
			filter: '',
			legalHold: true,
		});

		expect(getSoapFetchRequest).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/backup/getBackupAccounts?page=0&pageSize=50&domains=example.com&filter=&legalHold=true',
		);
	});

	it('surfaces the all_server error while keeping the parsed data', async () => {
		vi.mocked(getSoapFetchRequest).mockResolvedValue({
			accounts: [{ name: 'a@example.com' }],
			maxPage: 1,
			all_server: { error: { message: 'backup server unreachable' } },
		});

		const result = await getBackupAccounts({
			page: 0,
			pageSize: 10,
			domains: 'example.com',
			filter: '',
		});

		expect(result).toEqual({
			accounts: [{ name: 'a@example.com' }],
			maxPage: 1,
			allServerError: 'backup server unreachable',
		});
	});
});

describe('doRestoreOnNewAccount', () => {
	it('posts the restore body to the target server', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue({ operationId: 'op-1' });

		const body = {
			srcAccountName: 'deleted@example.com',
			dstAccountName: 'restored@example.com',
			date: 1600000000000,
			obeyHSM: false,
		};

		const result = await doRestoreOnNewAccount(body, 'server-1');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=server-1',
			body,
		);
		expect(result).toEqual({ operationId: 'op-1' });
	});
});
