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

import { parseAccountListDirectory, useAccountListDirectory } from '../use-account-list-directory';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const PARAMS = {
	attr: 'displayName,zimbraId',
	type: 'accounts',
	domainName: 'example.com',
	query: '(&(objectClass=zimbraAccount))',
	offset: 0,
	limit: 20,
};

describe('parseAccountListDirectory', () => {
	it('should return the account entries of the response', () => {
		const accounts = [{ id: 'acc-1', name: 'jane@example.com' }];
		expect(parseAccountListDirectory({ account: accounts })).toEqual(accounts);
	});

	it('should prefer distribution list entries when present', () => {
		const accounts = [{ id: 'acc-1', name: 'jane@example.com' }];
		const dls = [{ id: 'dl-1', name: 'team@example.com' }];
		expect(parseAccountListDirectory({ account: accounts, dl: dls })).toEqual(dls);
	});

	it('should return an empty array for empty responses', () => {
		expect(parseAccountListDirectory({})).toEqual([]);
	});
});

describe('useAccountListDirectory', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return parsed entries and call the service with the params', async () => {
		const accounts = [{ id: 'acc-1', name: 'jane@example.com' }];
		mockAccountListDirectory.mockResolvedValue({ account: accounts });

		const { result } = renderHook(() => useAccountListDirectory(PARAMS), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(accounts));
		expect(mockAccountListDirectory).toHaveBeenCalledWith(
			PARAMS.attr,
			PARAMS.type,
			PARAMS.domainName,
			PARAMS.query,
			PARAMS.offset,
			PARAMS.limit,
			undefined,
			undefined,
		);
	});

	it('should keep previous data while the next page resolves', async () => {
		mockAccountListDirectory.mockResolvedValue({
			account: [{ id: 'acc-1', name: 'jane@example.com' }],
		});

		const { result, rerender } = renderHook(
			({ offset }) => useAccountListDirectory({ ...PARAMS, offset }),
			{ wrapper: makeWrapper(new QueryClient()), initialProps: { offset: 0 } },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		mockAccountListDirectory.mockResolvedValue({
			account: [{ id: 'acc-2', name: 'john@example.com' }],
		});
		rerender({ offset: 20 });

		expect(result.current.isPlaceholderData).toBe(true);
		expect(result.current.data).toEqual([{ id: 'acc-1', name: 'jane@example.com' }]);
		await waitFor(() =>
			expect(result.current.data).toEqual([{ id: 'acc-2', name: 'john@example.com' }]),
		);
	});

	it('should refetch when the query string changes', async () => {
		mockAccountListDirectory.mockResolvedValue({ account: [] });

		const { result, rerender } = renderHook(
			({ query }) => useAccountListDirectory({ ...PARAMS, query }),
			{ wrapper: makeWrapper(new QueryClient()), initialProps: { query: PARAMS.query } },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		rerender({ query: '(&(objectClass=zimbraAccount)(mail=*jane*))' });

		await waitFor(() => expect(mockAccountListDirectory).toHaveBeenCalledTimes(2));
		expect(mockAccountListDirectory).toHaveBeenLastCalledWith(
			PARAMS.attr,
			PARAMS.type,
			PARAMS.domainName,
			'(&(objectClass=zimbraAccount)(mail=*jane*))',
			PARAMS.offset,
			PARAMS.limit,
			undefined,
			undefined,
		);
	});

	it('should surface service errors', async () => {
		mockAccountListDirectory.mockRejectedValue(new Error('boom'));

		const { result } = renderHook(() => useAccountListDirectory(PARAMS), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 4_000 });
	});
});
