/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	getDomainList: vi.fn(),
}));

import { getDomainList } from '@zextras/ui-shared';

import { useDomainList } from '../use-domain-list';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return { wrapper: Wrapper };
}

const PAGE_ONE = { domain: [{ name: 'example.com', id: 'domain-1', a: [] }], more: true, searchTotal: 2, _jsns: 'urn:zimbra' };
const PAGE_TWO = { domain: [{ name: 'other.org', id: 'domain-2', a: [] }], more: false, searchTotal: 2, _jsns: 'urn:zimbra' };

describe('useDomainList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches all pages until more is false and aggregates the domains', async () => {
		vi.mocked(getDomainList).mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(PAGE_TWO);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDomainList(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual([...PAGE_ONE.domain, ...PAGE_TWO.domain]);
		expect(getDomainList).toHaveBeenCalledTimes(2);
		expect(getDomainList).toHaveBeenNthCalledWith(1, '', 0);
		expect(getDomainList).toHaveBeenNthCalledWith(2, '', 50);
	});

	it('stops after the first page when more is falsy', async () => {
		vi.mocked(getDomainList).mockResolvedValue(PAGE_TWO);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDomainList(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(PAGE_TWO.domain);
		expect(getDomainList).toHaveBeenCalledTimes(1);
		expect(getDomainList).toHaveBeenCalledWith('', 0);
	});

	it('keeps paginating without pushing when a page has no domains', async () => {
		vi.mocked(getDomainList)
			.mockResolvedValueOnce({ more: true, searchTotal: 1, _jsns: 'urn:zimbra' })
			.mockResolvedValueOnce(PAGE_TWO);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDomainList(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(PAGE_TWO.domain);
		expect(getDomainList).toHaveBeenCalledTimes(2);
	});

	it('surfaces fetch errors', async () => {
		vi.mocked(getDomainList).mockRejectedValue(new Error('boom'));

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDomainList(), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 4_000 });
		expect((result.current.error as Error).message).toBe('boom');
	});
});
