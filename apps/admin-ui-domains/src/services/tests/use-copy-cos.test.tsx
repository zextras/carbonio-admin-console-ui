/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../copy-cos-service', () => ({
	copyCos: vi.fn(),
}));

import { copyCos } from '../copy-cos-service';
import { useCopyCos } from '../use-copy-cos';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return { wrapper: Wrapper, queryClient };
}

describe('useCopyCos', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls copyCos with the mutation variables', async () => {
		vi.mocked(copyCos).mockResolvedValue({ cos: [{ id: 'cos-copy-1' }] });

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCopyCos(), { wrapper });

		result.current.mutate({ newName: 'default-copy', cosId: 'cos-1' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(copyCos).toHaveBeenCalledWith('default-copy', 'cos-1');
	});

	it('invalidates the cos list queries on success', async () => {
		vi.mocked(copyCos).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useCopyCos(), { wrapper });

		result.current.mutate({ newName: 'default-copy', cosId: 'cos-1' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cos', 'list'] });
	});

	it('surfaces copyCos failures', async () => {
		vi.mocked(copyCos).mockRejectedValue(new Error('CopyCos failed'));

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCopyCos(), { wrapper });

		result.current.mutate({ newName: 'default-copy', cosId: 'cos-1' });

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('CopyCos failed');
	});
});
