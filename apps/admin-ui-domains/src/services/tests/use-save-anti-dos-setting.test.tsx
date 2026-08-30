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
	set: vi.fn(),
}));

vi.mock('../mobile-anti-dos-service', () => ({
	setMobileAntiDosService: mocks.set,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useSaveAntiDosSetting } from '../use-save-anti-dos-setting';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const OK_ENVELOPE = { Body: { response: {} } };

describe('useSaveAntiDosSetting', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should dispatch enabled to the enabled setter and invalidate the config query', async () => {
		mocks.set.mockResolvedValue(OK_ENVELOPE);
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSaveAntiDosSetting(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ field: 'enabled', value: true }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.set).toHaveBeenCalledWith('mobileAntiDosServiceEnabled', true);
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.antiDosConfig() });
	});

	it('should dispatch each numeric field to its own setter', async () => {
		mocks.set.mockResolvedValue(OK_ENVELOPE);
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSaveAntiDosSetting(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ field: 'jailDuration', value: 30 }));
		await waitFor(() =>
			expect(mocks.set).toHaveBeenCalledWith('mobileAntiDosServiceJailDuration', 30),
		);
		await act(async () => result.current.mutate({ field: 'maxRequests', value: 100 }));
		await waitFor(() =>
			expect(mocks.set).toHaveBeenCalledWith('mobileAntiDosServiceMaxRequests', 100),
		);
		await act(async () => result.current.mutate({ field: 'timeWindow', value: 60000 }));
		await waitFor(() =>
			expect(mocks.set).toHaveBeenCalledWith('mobileAntiDosServiceTimeWindow', 60000),
		);
	});

	it('should throw when the envelope carries a SOAP Fault', async () => {
		mocks.set.mockResolvedValue({
			Body: { Fault: { Reason: { Text: 'denied' } } },
		});
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSaveAntiDosSetting(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ field: 'enabled', value: false }));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('denied');
	});
});
