/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useInvalidateCosQuota } from '../use-invalidate-cos-quota';

function createWrapper() {
	const queryClient = new QueryClient();
	const Wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		Wrapper.displayName = 'Wrapper';
	return {
		wrapper: Wrapper,
		queryClient,
	};
}

describe('useInvalidateCosQuota', () => {
	it('should return a function that invalidates cos quota queries', async () => {
		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useInvalidateCosQuota(), { wrapper });

		await result.current('cos-123');

		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ['cos', 'cos-quota', 'cos-123'],
		});
	});

	it('should invalidate with different cosIds', async () => {
		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useInvalidateCosQuota(), { wrapper });

		await result.current('cos-1');
		await result.current('cos-2');

		expect(invalidateSpy).toHaveBeenCalledTimes(2);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ['cos', 'cos-quota', 'cos-1'],
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ['cos', 'cos-quota', 'cos-2'],
		});
	});
});
