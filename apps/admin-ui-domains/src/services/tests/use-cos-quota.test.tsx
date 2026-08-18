/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetCosQuota = vi.hoisted(() => vi.fn());

vi.mock('../get-cos-quota', () => ({
	getCosQuota: mockGetCosQuota,
}));

import { useCosQuota } from '../use-cos-quota';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const SUCCESS = {
	type: 'success' as const,
	totalComputedLimit: { type: 'unlimited' as const },
};

describe('useCosQuota', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return the success payload', async () => {
		mockGetCosQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useCosQuota('cos-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(SUCCESS));
		expect(mockGetCosQuota).toHaveBeenCalledWith('cos-1');
	});

	it('should throw when the service returns an error result', async () => {
		mockGetCosQuota.mockResolvedValue({ type: 'error', error: 'boom' });

		const { result } = renderHook(() => useCosQuota('cos-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect((result.current.error as Error).message).toBe('boom');
	});

	it('should stay disabled while the cos id is undefined', async () => {
		mockGetCosQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useCosQuota(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetCosQuota).not.toHaveBeenCalled();
	});
});
