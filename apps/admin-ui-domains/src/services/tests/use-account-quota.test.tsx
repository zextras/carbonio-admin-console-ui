/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAccountQuota = vi.hoisted(() => vi.fn());

vi.mock('../account-quota', () => ({
	getAccountQuota: mockGetAccountQuota,
}));

import { useAccountQuota } from '../use-account-quota';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const SUCCESS = {
	type: 'success' as const,
	totalComputedLimit: { type: 'limited' as const, value: 1024 },
	totalLimitSource: 'domain' as const,
	totalStatus: 'UNDERQUOTA' as const,
	totalUsed: 512,
	usedByModules: { mailbox: 256, files: 128, wsc: 128 },
};

describe('useAccountQuota', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return the success payload', async () => {
		mockGetAccountQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useAccountQuota('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(SUCCESS));
		expect(mockGetAccountQuota).toHaveBeenCalledWith('account-1');
	});

	it('should throw when the service returns an error result', async () => {
		mockGetAccountQuota.mockResolvedValue({ type: 'error', error: 'boom' });

		const { result } = renderHook(() => useAccountQuota('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect((result.current.error as Error).message).toBe('boom');
	});

	it('should stay disabled while the account id is undefined', async () => {
		mockGetAccountQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useAccountQuota(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetAccountQuota).not.toHaveBeenCalled();
	});
});
