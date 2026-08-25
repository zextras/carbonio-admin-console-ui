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
	doStratStopJail: vi.fn(),
}));

vi.mock('../do-start-stop-jail', () => ({
	doStratStopJail: mocks.doStratStopJail,
}));

import { useRestartJail } from '../use-restart-jail';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const OK_ENVELOPE = { Body: { response: {} } };

describe('useRestartJail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should start the service on every given mailstore server', async () => {
		mocks.doStratStopJail.mockResolvedValue(OK_ENVELOPE);
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useRestartJail(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(['mail1.example.com', 'mail2.example.com']));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.doStratStopJail).toHaveBeenCalledTimes(2);
		expect(mocks.doStratStopJail).toHaveBeenNthCalledWith(
			1,
			'doStartService',
			'mail1.example.com',
		);
		expect(mocks.doStratStopJail).toHaveBeenNthCalledWith(
			2,
			'doStartService',
			'mail2.example.com',
		);
	});

	it('should throw the fault reason when any server response carries a SOAP Fault', async () => {
		mocks.doStratStopJail
			.mockResolvedValueOnce(OK_ENVELOPE)
			.mockResolvedValueOnce({ Body: { Fault: { Reason: { Text: 'jail unavailable' } } } });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useRestartJail(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(['mail1.example.com', 'mail2.example.com']));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('jail unavailable');
	});

	it('should resolve without calling the service when no servers are given', async () => {
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useRestartJail(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate([]));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mocks.doStratStopJail).not.toHaveBeenCalled();
	});
});
