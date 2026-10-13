/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../count-account-service', () => ({
	countAccount: vi.fn(),
}));

import { countAccount } from '../count-account-service';
import { parseAccountCount, useCountAccount } from '../use-count-account';

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

describe('parseAccountCount', () => {
	it('sums COS counts excluding defaultExternal', () => {
		const res = {
			cos: {
				default: { name: 'default', _content: '7' },
				external: { name: 'defaultExternal', _content: '100' },
				premium: { name: 'premium', _content: '3' },
			},
		};
		expect(parseAccountCount(res)).toBe(10);
	});

	it('returns 0 when the response has no cos entries', () => {
		expect(parseAccountCount({})).toBe(0);
		expect(parseAccountCount(undefined)).toBe(0);
	});
});

describe('useCountAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches and parses the account count for the domain', async () => {
		vi.mocked(countAccount).mockResolvedValue({
			cos: {
				default: { name: 'default', _content: '7' },
				external: { name: 'defaultExternal', _content: '100' },
			},
		});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCountAccount('example.com'), { wrapper });

		await waitFor(() => expect(result.current.data).toBe(7));
		expect(countAccount).toHaveBeenCalledWith('example.com');
	});

	it('is disabled without a domain name', async () => {
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCountAccount(undefined), { wrapper });

		expect(result.current.fetchStatus).toBe('idle');
		expect(countAccount).not.toHaveBeenCalled();
	});
});
