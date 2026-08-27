/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../end-session', () => ({
	endSession: vi.fn(),
}));

import { domainQueryKeys } from '../domain-query-keys';
import { endSession } from '../end-session';
import { useEndSession } from '../use-end-session';

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

describe('useEndSession', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const vars = { sessionId: 'sid-1', accountName: 'user@example.com', token: 'tok' };

	it('calls endSession with vars', async () => {
		vi.mocked(endSession).mockResolvedValue({ _jsns: 'urn:zimbraAccount' });

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useEndSession(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(endSession).toHaveBeenCalledWith('sid-1', 'user@example.com', 'tok');
	});

	it('throws when the response has no _jsns (session end failed)', async () => {
		vi.mocked(endSession).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useEndSession(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isError).toBe(true));
	});

	it('invalidates userSessions on success', async () => {
		vi.mocked(endSession).mockResolvedValue({ _jsns: 'urn:zimbraAccount' });

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useEndSession(), { wrapper });

		result.current.mutate(vars);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.userSessions('user@example.com'),
		});
	});
});
