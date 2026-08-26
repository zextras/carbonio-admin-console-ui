/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../delete-account-service', () => ({
	deleteAccount: vi.fn(),
}));

import { deleteAccount } from '../delete-account-service';
import { domainQueryKeys } from '../domain-query-keys';
import { useDeleteAccount } from '../use-delete-account';

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

describe('useDeleteAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const vars = { accountId: 'acc-1' };

	it('calls deleteAccount with vars', async () => {
		vi.mocked(deleteAccount).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDeleteAccount(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(deleteAccount).toHaveBeenCalledWith('acc-1');
	});

	it('invalidates the account list directory on success', async () => {
		vi.mocked(deleteAccount).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useDeleteAccount(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountListDirectory.base(),
		});
	});
});
