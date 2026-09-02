/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAccountListDirectory = vi.hoisted(() => vi.fn());

vi.mock('../account-list-directory-service', () => ({
	accountListDirectory: mockAccountListDirectory,
}));

import { useDomainAdminAccounts } from '../use-domain-admin-accounts';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const RAW_ACCOUNT = {
	id: 'acc-1',
	name: 'delegated1@example.com',
	a: [
		{ n: 'mail', _content: 'delegated1@example.com' },
		{ n: 'displayName', _content: 'Delegate One' },
		{ n: 'zimbraIsDelegatedAdminAccount', _content: 'TRUE' },
	],
};

describe('useDomainAdminAccounts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should query admin and delegated admin accounts with pagination params', async () => {
		mockAccountListDirectory.mockResolvedValue({
			account: [RAW_ACCOUNT],
			searchTotal: 42,
		});

		const { result } = renderHook(
			() => useDomainAdminAccounts({ domainName: 'example.com', offset: 0, limit: 10 }),
			{ wrapper: makeWrapper(new QueryClient()) },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		const [attr, type, domainName, query, offset, limit] =
			mockAccountListDirectory.mock.calls[0];
		expect(type).toBe('accounts');
		expect(domainName).toBe('example.com');
		expect(query).toContain('zimbraIsAdminAccount=TRUE');
		expect(query).toContain('zimbraIsDelegatedAdminAccount=TRUE');
		expect(offset).toBe(0);
		expect(limit).toBe(10);
		expect(attr).toContain('zimbraIsAdminAccount');
	});

	it('should project accounts with flattened attributes and the search total', async () => {
		mockAccountListDirectory.mockResolvedValue({
			account: [RAW_ACCOUNT],
			searchTotal: 42,
		});

		const { result } = renderHook(
			() => useDomainAdminAccounts({ domainName: 'example.com', offset: 0, limit: 10 }),
			{ wrapper: makeWrapper(new QueryClient()) },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual({
			accounts: [
				{
					id: 'acc-1',
					name: 'delegated1@example.com',
					item: {
						id: 'acc-1',
						name: 'delegated1@example.com',
						a: RAW_ACCOUNT.a,
						mail: ['delegated1@example.com'],
						displayName: 'Delegate One',
						zimbraIsDelegatedAdminAccount: 'TRUE',
					},
				},
			],
			total: 42,
		});
	});

	it('should default to an empty list and zero total when the response has no accounts', async () => {
		mockAccountListDirectory.mockResolvedValue({ searchTotal: 0 });

		const { result } = renderHook(
			() => useDomainAdminAccounts({ domainName: 'example.com', offset: 0, limit: 10 }),
			{ wrapper: makeWrapper(new QueryClient()) },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual({ accounts: [], total: 0 });
	});

	it('should not fetch while the domain is unknown', async () => {
		renderHook(
			() => useDomainAdminAccounts({ domainName: undefined, offset: 0, limit: 10 }),
			{ wrapper: makeWrapper(new QueryClient()) },
		);

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(mockAccountListDirectory).not.toHaveBeenCalled();
	});
});
