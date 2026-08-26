/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../rename-account', () => ({
	renameAccountRequest: vi.fn(),
}));

import { domainQueryKeys } from '../domain-query-keys';
import { renameAccountRequest } from '../rename-account';
import { useRenameAccount } from '../use-rename-account';

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

describe('useRenameAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const vars = { id: 'acc-1', newName: 'renamed@example.com' };

	it('calls renameAccountRequest with vars', async () => {
		vi.mocked(renameAccountRequest).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useRenameAccount(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(renameAccountRequest).toHaveBeenCalledWith(vars.id, vars.newName);
	});

	it('invalidates accountDetail and the account list directory on success', async () => {
		vi.mocked(renameAccountRequest).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useRenameAccount(), { wrapper });

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
