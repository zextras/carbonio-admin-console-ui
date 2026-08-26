/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../add-account-alias', () => ({
	addAccountAliasRequest: vi.fn(),
}));

import { addAccountAliasRequest } from '../add-account-alias';
import { domainQueryKeys } from '../domain-query-keys';
import { useAddAccountAlias } from '../use-add-account-alias';

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

describe('useAddAccountAlias', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const vars = { id: 'acc-1', alias: 'alias@example.com' };

	it('calls addAccountAliasRequest with vars', async () => {
		vi.mocked(addAccountAliasRequest).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useAddAccountAlias(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(addAccountAliasRequest).toHaveBeenCalledWith('acc-1', 'alias@example.com');
	});

	it('invalidates accountDetail and the account list directory on success', async () => {
		vi.mocked(addAccountAliasRequest).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useAddAccountAlias(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountDetail('acc-1'),
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountListDirectory.base(),
		});
	});
});
