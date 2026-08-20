/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAddDistributionListMember = vi.hoisted(() => vi.fn());

vi.mock('../add-distributionlist-member-service', () => ({
	addDistributionListMember: mockAddDistributionListMember,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useAddDistributionListMember } from '../use-add-distribution-list-member';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const INPUT = { listId: 'dl-1', member: 'jane@example.com' };

describe('useAddDistributionListMember', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service and invalidate the membership query', async () => {
		mockAddDistributionListMember.mockResolvedValue({});
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useAddDistributionListMember('account-1'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockAddDistributionListMember).toHaveBeenCalledWith(
			{ n: 'id', _content: 'dl-1' },
			{ n: 'dlm', _content: 'jane@example.com' },
		);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.accountMembership('account-1'),
		});
	});

	it('should surface service errors', async () => {
		mockAddDistributionListMember.mockRejectedValue(new Error('boom'));
		const { result } = renderHook(() => useAddDistributionListMember('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('boom');
	});
});
