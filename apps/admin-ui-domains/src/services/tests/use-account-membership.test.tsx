/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAccountMembershipRequest = vi.hoisted(() => vi.fn());

vi.mock('../get-account-membership', () => ({
	getAccountMembershipRequest: mockGetAccountMembershipRequest,
}));

import { useAccountMembership } from '../use-account-membership';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useAccountMembership', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return the dl array for the account', async () => {
		const dl = [{ name: 'list-1' }, { name: 'list-2', via: 'nested' }];
		mockGetAccountMembershipRequest.mockResolvedValue({ dl });

		const { result } = renderHook(() => useAccountMembership('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(dl));
		expect(mockGetAccountMembershipRequest).toHaveBeenCalledWith('account-1');
	});

	it('should return an empty array when dl is missing', async () => {
		mockGetAccountMembershipRequest.mockResolvedValue({});

		const { result } = renderHook(() => useAccountMembership('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual([]));
	});

	it('should expose the error when the service rejects', async () => {
		mockGetAccountMembershipRequest.mockRejectedValue(new Error('boom'));

		const { result } = renderHook(() => useAccountMembership('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect((result.current.error as Error).message).toBe('boom');
	});

	it('should stay disabled while the account id is undefined', async () => {
		mockGetAccountMembershipRequest.mockResolvedValue({ dl: [] });

		const { result } = renderHook(() => useAccountMembership(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetAccountMembershipRequest).not.toHaveBeenCalled();
	});
});
