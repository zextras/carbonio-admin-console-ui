/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetInitializedDomains = vi.hoisted(() => vi.fn());

vi.mock('../get-initialized-domains', () => ({
	getInitializedDomains: mockGetInitializedDomains,
}));

import { useInitializedDomains } from '../use-initialized-domains';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useInitializedDomains', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return domains for the search string', async () => {
		const domains = [{ name: 'example.com', id: 'domain-1' }];
		mockGetInitializedDomains.mockResolvedValue({ domain: domains, searchTotal: 1 });

		const { result } = renderHook(() => useInitializedDomains('example'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual({ domain: domains, searchTotal: 1 }));
		expect(mockGetInitializedDomains).toHaveBeenCalledWith({ domainName: 'example' });
	});

	it('should fetch with an empty search on initial load', async () => {
		mockGetInitializedDomains.mockResolvedValue({ domain: [], searchTotal: 0 });

		const { result } = renderHook(() => useInitializedDomains(''), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockGetInitializedDomains).toHaveBeenCalledWith({ domainName: '' });
	});

	it('should keep previous data while a new search resolves', async () => {
		mockGetInitializedDomains.mockResolvedValue({
			domain: [{ name: 'example.com', id: 'domain-1' }],
			searchTotal: 1,
		});

		const queryClient = new QueryClient();
		const { result, rerender } = renderHook(({ search }) => useInitializedDomains(search), {
			wrapper: makeWrapper(queryClient),
			initialProps: { search: 'example' },
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		mockGetInitializedDomains.mockResolvedValue({
			domain: [{ name: 'other.org', id: 'domain-2' }],
			searchTotal: 1,
		});
		rerender({ search: 'other' });

		await waitFor(() => expect(result.current.isFetching).toBe(true));
		expect(result.current.isPlaceholderData).toBe(true);
		expect(result.current.data).toEqual({
			domain: [{ name: 'example.com', id: 'domain-1' }],
			searchTotal: 1,
		});

		await waitFor(() =>
			expect(result.current.data).toEqual({
				domain: [{ name: 'other.org', id: 'domain-2' }],
				searchTotal: 1,
			}),
		);
	});

	it('should surface service errors', async () => {
		mockGetInitializedDomains.mockRejectedValue(new Error('boom'));

		const { result } = renderHook(() => useInitializedDomains('example'), {
			wrapper: makeWrapper(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
		});

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 4_000 });
		expect((result.current.error as Error).message).toBe('boom');
	});
});
