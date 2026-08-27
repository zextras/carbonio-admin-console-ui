/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../batch-service', () => ({
	batchService: vi.fn(),
}));

import { batchService } from '../batch-service';
import { domainQueryKeys } from '../domain-query-keys';
import { useBatchDelegates } from '../use-batch-delegates';

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

describe('useBatchDelegates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls batchService with the request object and otherAccount', async () => {
		vi.mocked(batchService).mockResolvedValue({});

		const reqObject = { BatchRequest: { _jsns: 'urn:zimbraAdmin' } };

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useBatchDelegates('acc-1'), { wrapper });

		result.current.mutate({ reqObject, otherAccount: 'delegate@example.com' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(batchService).toHaveBeenCalledWith(reqObject, 'delegate@example.com');
	});

	it('invalidates accountGrants and accountMembership on success', async () => {
		vi.mocked(batchService).mockResolvedValue({});

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useBatchDelegates('acc-1'), { wrapper });

		result.current.mutate({ reqObject: {} });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountGrants('acc-1'),
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountMembership('acc-1'),
		});
	});
});
