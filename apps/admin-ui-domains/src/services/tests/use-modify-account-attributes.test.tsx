/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../modify-account', () => ({
	modifyAccountRequest: vi.fn(),
}));

import { modifyAccountRequest } from '../modify-account';
import { useModifyAccountAttributes } from '../use-modify-account-attributes';

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

describe('useModifyAccountAttributes', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls modifyAccountRequest with id and modified data', async () => {
		vi.mocked(modifyAccountRequest).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useModifyAccountAttributes(), { wrapper });

		result.current.mutate({ id: 'acc-1', modifiedData: { displayName: 'New Name' } });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(modifyAccountRequest).toHaveBeenCalledWith('acc-1', { displayName: 'New Name' });
	});

	it('owns no invalidation or snackbar (save handler owns both)', async () => {
		vi.mocked(modifyAccountRequest).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useModifyAccountAttributes(), { wrapper });

		result.current.mutate({ id: 'acc-1', modifiedData: { sn: 'User' } });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).not.toHaveBeenCalled();
	});
});
