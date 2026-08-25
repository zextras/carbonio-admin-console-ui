/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../create-domain', () => ({
	createDomain: vi.fn(),
}));

import { createDomain } from '../create-domain';
import { useCreateDomain } from '../use-create-domain';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return {
		wrapper: Wrapper,
		queryClient
	};
}

describe('useCreateDomain', () => {
	it('should call createDomain with the provided name and attributes on mutate', async () => {
		const mockResponse = { domain: [{ id: 'domain-1', name: 'example.com' }] };
		vi.mocked(createDomain).mockResolvedValue(mockResponse);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCreateDomain(), { wrapper });

		const attributes = [{ n: 'zimbraDomainStatus', _content: 'active' }];
		result.current.mutate({ name: 'example.com', attributes });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createDomain).toHaveBeenCalledWith('example.com', attributes);
	});

	it('should invalidate all domain queries on success', async () => {
		vi.mocked(createDomain).mockResolvedValue({ domain: [] });

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useCreateDomain(), { wrapper });

		result.current.mutate({ name: 'example.com' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['domain'] });
	});

	it('should not invalidate domain queries on error', async () => {
		vi.mocked(createDomain).mockRejectedValue(new Error('Create failed'));

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useCreateDomain(), { wrapper });

		result.current.mutate({ name: 'example.com' });

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(invalidateSpy).not.toHaveBeenCalled();
	});
});
