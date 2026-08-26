/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../create-account', () => ({
	createAccountRequest: vi.fn(),
}));

import { createAccountRequest } from '../create-account';
import { domainQueryKeys } from '../domain-query-keys';
import { useCreateAccount } from '../use-create-account';

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

describe('useCreateAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const vars = {
		attr: { displayName: 'John', zimbraAccountStatus: 'active' },
		name: 'john@example.com',
		password: 'secret',
	};

	it('calls createAccountRequest with vars', async () => {
		vi.mocked(createAccountRequest).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCreateAccount(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createAccountRequest).toHaveBeenCalledWith(vars.attr, vars.name, vars.password);
	});

	it('invalidates the account list directory on success', async () => {
		vi.mocked(createAccountRequest).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useCreateAccount(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountListDirectory.base(),
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountCount.base(),
		});
	});

	it('propagates the error to the mutation state', async () => {
		vi.mocked(createAccountRequest).mockRejectedValue(new Error('boom'));

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCreateAccount(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toEqual(new Error('boom'));
	});
});
