/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../set-password', () => ({
	setPasswordRequest: vi.fn(),
}));

import { domainQueryKeys } from '../domain-query-keys';
import { setPasswordRequest } from '../set-password';
import { useSetPassword } from '../use-set-password';

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

describe('useSetPassword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls setPasswordRequest with the new password', async () => {
		vi.mocked(setPasswordRequest).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useSetPassword(), { wrapper });

		result.current.mutate({ id: 'acc-1', newPassword: 'new-secret' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(setPasswordRequest).toHaveBeenCalledWith('acc-1', 'new-secret');
	});

	it('supports clearing the password (undefined newPassword)', async () => {
		vi.mocked(setPasswordRequest).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useSetPassword(), { wrapper });

		result.current.mutate({ id: 'acc-1' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(setPasswordRequest).toHaveBeenCalledWith('acc-1', undefined);
	});

	it('invalidates accountDetail on success', async () => {
		vi.mocked(setPasswordRequest).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useSetPassword(), { wrapper });

		result.current.mutate({ id: 'acc-1', newPassword: 'new-secret' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountDetail('acc-1'),
		});
	});
});
