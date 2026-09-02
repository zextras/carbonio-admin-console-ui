/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	doPurgeActiveSync: vi.fn(),
}));

vi.mock('../do-purge-mobile-state', () => ({
	doPurgeActiveSync: mocks.doPurgeActiveSync,
}));

import { usePurgeActiveSync } from '../use-purge-active-sync';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const OK_ENVELOPE = { Body: { response: {} } };

describe('usePurgeActiveSync', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should resolve after purging the mobile state', async () => {
		mocks.doPurgeActiveSync.mockResolvedValue(OK_ENVELOPE);
		const queryClient = new QueryClient();

		const { result } = renderHook(() => usePurgeActiveSync(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate());
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mocks.doPurgeActiveSync).toHaveBeenCalledTimes(1);
	});

	it('should throw the fault reason when the response carries a SOAP Fault', async () => {
		mocks.doPurgeActiveSync.mockResolvedValue({
			Body: { Fault: { Reason: { Text: 'purge not possible' } } },
		});
		const queryClient = new QueryClient();

		const { result } = renderHook(() => usePurgeActiveSync(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate());
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('purge not possible');
	});

	it('should throw the fallback message when the Fault has no reason text', async () => {
		mocks.doPurgeActiveSync.mockResolvedValue({ Body: { Fault: {} } });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => usePurgeActiveSync(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate());
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('purging ActiveSync failed');
	});
});
