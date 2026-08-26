/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../set-account-quota', () => ({
	setAccountQuota: vi.fn(),
}));

vi.mock('../unset-account-quota', () => ({
	unsetAccountQuota: vi.fn(),
}));

import { domainQueryKeys } from '../domain-query-keys';
import { setAccountQuota } from '../set-account-quota';
import { unsetAccountQuota } from '../unset-account-quota';
import { useSetAccountQuota } from '../use-set-account-quota';

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

describe('useSetAccountQuota', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('sets the quota when a limited value is given', async () => {
		vi.mocked(setAccountQuota).mockResolvedValue({ type: 'success' });

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useSetAccountQuota(), { wrapper });

		result.current.mutate({ accountId: 'acc-1', limit: { type: 'limited', value: 1024 } });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(setAccountQuota).toHaveBeenCalledWith('acc-1', { type: 'limited', value: 1024 });
		expect(unsetAccountQuota).not.toHaveBeenCalled();
	});

	it('unsets the quota when the limit is unlimited or missing', async () => {
		vi.mocked(unsetAccountQuota).mockResolvedValue({ type: 'success' });

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useSetAccountQuota(), { wrapper });

		result.current.mutate({ accountId: 'acc-1', limit: { type: 'unlimited' } });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		result.current.mutate({ accountId: 'acc-2' });

		await waitFor(() => expect(unsetAccountQuota).toHaveBeenCalledTimes(2));
		expect(unsetAccountQuota).toHaveBeenCalledWith('acc-1');
		expect(unsetAccountQuota).toHaveBeenCalledWith('acc-2');
		expect(setAccountQuota).not.toHaveBeenCalled();
	});

	it('throws when the service reports an error', async () => {
		vi.mocked(unsetAccountQuota).mockResolvedValue({ type: 'error', error: 'quota failed' });

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useSetAccountQuota(), { wrapper });

		result.current.mutate({ accountId: 'acc-1' });

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toEqual(new Error('quota failed'));
	});

	it('invalidates accountQuota and accountDetail on success', async () => {
		vi.mocked(setAccountQuota).mockResolvedValue({ type: 'success' });

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useSetAccountQuota(), { wrapper });

		result.current.mutate({ accountId: 'acc-1', limit: { type: 'limited', value: 1024 } });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountQuota('acc-1'),
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountDetail('acc-1'),
		});
	});
});
