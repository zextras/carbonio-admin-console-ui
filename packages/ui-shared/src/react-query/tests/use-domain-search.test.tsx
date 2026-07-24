/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDomainSearch } from '../use-domain-search';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return Wrapper;
}

describe('useDomainSearch', () => {
	it('runs the injected queryFn and returns its data', async () => {
		const mockData = {
			domain: [{ id: 'd1', name: 'example.com', a: [] }],
			more: false,
			searchTotal: 1,
		};
		const queryFn = vi.fn().mockResolvedValue(mockData);

		const wrapper = createWrapper();
		const { result } = renderHook(
			() => useDomainSearch({ searchQuery: 'exam', limit: 10, offset: 0, queryFn }),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(queryFn).toHaveBeenCalled();
		expect(result.current.data).toEqual(mockData);
	});

	it('does not run the queryFn when enabled is false', () => {
		const queryFn = vi.fn();

		const wrapper = createWrapper();
		const { result } = renderHook(
			() => useDomainSearch({ searchQuery: '', limit: 10, offset: 0, enabled: false, queryFn }),
			{ wrapper },
		);

		expect(result.current.fetchStatus).toBe('idle');
		expect(queryFn).not.toHaveBeenCalled();
	});

	it('is enabled by default', async () => {
		const queryFn = vi.fn().mockResolvedValue({ domain: [], more: false, searchTotal: 0 });

		const wrapper = createWrapper();
		const { result } = renderHook(
			() => useDomainSearch({ searchQuery: '', limit: 50, offset: 0, queryFn }),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(queryFn).toHaveBeenCalled();
	});

	it('surfaces errors from the queryFn', async () => {
		const queryFn = vi.fn().mockRejectedValue(new Error('Search failed'));

		const wrapper = createWrapper();
		const { result } = renderHook(
			() => useDomainSearch({ searchQuery: 'x', limit: 10, offset: 0, queryFn }),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
