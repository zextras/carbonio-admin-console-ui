/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCosList } from '../use-cos-list';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

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

describe('useCosList', () => {
	it('should fetch cos list with provided parameters', async () => {
		const mockResponse = { cos: [{ id: 'cos-1', name: 'default', a: [] }], more: false, searchTotal: 1 };
		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCosList({ searchQuery: 'test', limit: 10, offset: 0 }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', expect.objectContaining({}));
		expect(result.current.data).toEqual(mockResponse);
	});

	it('should not fetch when enabled is false', () => {
		const wrapper = createWrapper();
		const { result } = renderHook(
			() => useCosList({ searchQuery: '', limit: 10, offset: 0, enabled: false }),
			{ wrapper },
		);

		expect(result.current.fetchStatus).toBe('idle');
		expect(soapFetch).not.toHaveBeenCalled();
	});

	it('should be enabled by default', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [], more: false, searchTotal: 0 });

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCosList({ searchQuery: '', limit: 50, offset: 0 }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(soapFetch).toHaveBeenCalled();
	});

	it('should handle fetch errors', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('Search failed'));

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCosList({ searchQuery: 'test', limit: 10, offset: 0 }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
