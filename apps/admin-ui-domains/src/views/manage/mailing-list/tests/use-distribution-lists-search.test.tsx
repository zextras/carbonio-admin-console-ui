/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();
const mockSearchDirectory = vi.fn();

vi.mock('@zextras/ui-components', () => ({
	useSnackbar: () => mockCreateSnackbar
}));

vi.mock('@zextras/ui-shared', () => ({
	searchDirectory: (...args: Array<Record<string, unknown>>) => mockSearchDirectory(...args)
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [(key: string, fallback?: string) => fallback ?? key]
}));

import { useDistributionListsSearch } from '../use-distribution-lists-search';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return { wrapper: Wrapper, queryClient };
}

describe('useDistributionListsSearch', () => {
	it('fetches the distribution lists of the domain with the default paging and sorting', async () => {
		mockSearchDirectory.mockResolvedValue({
			dl: [{ id: 'dl-1', name: 'team@example.com' }],
			searchTotal: 1
		});
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDistributionListsSearch('example.com'), { wrapper });

		await waitFor(() => expect(result.current.lists).toHaveLength(1));
		expect(result.current.totalAccount).toBe(1);
		expect(result.current.hasError).toBe(false);
		expect(mockSearchDirectory).toHaveBeenCalledWith(
			expect.objectContaining({
				attr: 'displayName,zimbraId,zimbraMailHost,uid,description,zimbraMailStatus,zimbraHideInGal',
				type: 'distributionlists,dynamicgroups',
				domainName: 'example.com',
				query: '(&(!(zimbraIsAdminGroup=TRUE)))',
				offset: 0,
				limit: 10,
				sortBy: 'displayName',
				sortAscending: 'asc'
			})
		);
	});

	it('shows an error snackbar and the error state when the search fails', async () => {
		mockSearchDirectory.mockRejectedValue(new Error('Search failed'));
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDistributionListsSearch('example.com'), { wrapper });

		await waitFor(() => expect(result.current.hasError).toBe(true));
		expect(result.current.lists).toEqual([]);
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({ severity: 'error', label: 'Search failed' })
		);
	});

	it('debounces the search string into the query', async () => {
		mockSearchDirectory.mockResolvedValue({ dl: [], searchTotal: 0 });
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDistributionListsSearch('example.com'), { wrapper });

		await waitFor(() => expect(mockSearchDirectory).toHaveBeenCalledTimes(1));

		act(() => {
			result.current.setSearchString('team');
		});

		await waitFor(
			() =>
				expect(mockSearchDirectory).toHaveBeenLastCalledWith(
					expect.objectContaining({ query: expect.stringContaining('*team*') })
				),
			{ timeout: 5000 }
		);
	});

	it('applies the status filter selected from the status header', async () => {
		mockSearchDirectory.mockResolvedValue({ dl: [], searchTotal: 0 });
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDistributionListsSearch('example.com'), { wrapper });

		await waitFor(() => expect(mockSearchDirectory).toHaveBeenCalledTimes(1));

		const statusHeader = result.current.headers.find((header) => header.id === 'status');

		act(() => {
			statusHeader?.onChange([{ value: '(&(zimbraMailStatus=enabled))' }]);
		});
		await waitFor(() =>
			expect(mockSearchDirectory).toHaveBeenLastCalledWith(
				expect.objectContaining({
					query: '(&(zimbraMailStatus=enabled))(&(!(zimbraIsAdminGroup=TRUE)))'
				})
			)
		);

		act(() => {
			statusHeader?.onChange([
				{ value: '(&(zimbraMailStatus=enabled))' },
				{ value: '(&(zimbraMailStatus=disabled))' }
			]);
		});
		await waitFor(() =>
			expect(mockSearchDirectory).toHaveBeenLastCalledWith(
				expect.objectContaining({
					query: '(|(&(zimbraMailStatus=enabled))(&(zimbraMailStatus=disabled)))(&(!(zimbraIsAdminGroup=TRUE)))'
				})
			)
		);

		act(() => {
			statusHeader?.onChange([]);
		});
		await waitFor(() =>
			expect(mockSearchDirectory).toHaveBeenLastCalledWith(
				expect.objectContaining({ query: '(&(!(zimbraIsAdminGroup=TRUE)))' })
			)
		);
	});

	it('applies sorting and paging changes', async () => {
		mockSearchDirectory.mockResolvedValue({ dl: [], searchTotal: 0 });
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDistributionListsSearch('example.com'), { wrapper });

		await waitFor(() => expect(mockSearchDirectory).toHaveBeenCalledTimes(1));

		const nameHeader = result.current.headers.find((header) => header.id === 'name');

		act(() => {
			nameHeader?.onSortChange('name', 'desc');
		});
		await waitFor(() =>
			expect(mockSearchDirectory).toHaveBeenLastCalledWith(
				expect.objectContaining({ sortBy: 'name', sortAscending: 'desc' })
			)
		);

		act(() => {
			result.current.setOffset(10);
			result.current.setLimit(20);
		});
		await waitFor(() =>
			expect(mockSearchDirectory).toHaveBeenLastCalledWith(
				expect.objectContaining({ offset: 10, limit: 20 })
			)
		);
	});
});
