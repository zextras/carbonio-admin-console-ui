/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useTotalAccounts } from '../use-total-accounts';

vi.mock('@zextras/ui-shared', () => ({
	searchDirectory: vi.fn(),
}));

import { searchDirectory } from '@zextras/ui-shared';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return Wrapper;
}

describe('useTotalAccounts', () => {
	it('should not fetch when cosId is undefined', () => {
		const wrapper = createWrapper();
		const { result } = renderHook(() => useTotalAccounts(undefined), { wrapper });

		expect(result.current.fetchStatus).toBe('idle');
		expect(searchDirectory).not.toHaveBeenCalled();
	});

	it('should search accounts with correct query', async () => {
		vi.mocked(searchDirectory).mockResolvedValue({ account: [], searchTotal: 42 });

		const wrapper = createWrapper();
		const { result } = renderHook(() => useTotalAccounts('cos-1'), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(searchDirectory).toHaveBeenCalledWith({
			attr: '',
			type: 'accounts',
			domainName: '',
			query: '(&(zimbraCOSId=cos-1)(!(zimbraIsSystemAccount=TRUE)))',
			offset: 0,
			limit: -1,
		});
		expect(result.current.data).toBe(42);
	});

	it('should return 0 when searchTotal is undefined', async () => {
		vi.mocked(searchDirectory).mockResolvedValue({ account: [] });

		const wrapper = createWrapper();
		const { result } = renderHook(() => useTotalAccounts('cos-2'), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toBe(0);
	});

	it('should handle fetch errors', async () => {
		vi.mocked(searchDirectory).mockRejectedValue(new Error('Search failed'));

		const wrapper = createWrapper();
		const { result } = renderHook(() => useTotalAccounts('cos-err'), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
