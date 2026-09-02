/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetAddressBookServiceEnabled = vi.hoisted(() => vi.fn());

vi.mock('../set-address-book-service-enabled', () => ({
	setAddressBookServiceEnabled: mockSetAddressBookServiceEnabled,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useSetAddressBookServiceEnabled } from '../use-set-address-book-service-enabled';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useSetAddressBookServiceEnabled', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service and invalidate the address book service query', async () => {
		mockSetAddressBookServiceEnabled.mockResolvedValue({ Body: { response: {} } });
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSetAddressBookServiceEnabled(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(true));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockSetAddressBookServiceEnabled).toHaveBeenCalledWith(true);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.addressBookService(),
		});
	});

	it('should surface the service error', async () => {
		mockSetAddressBookServiceEnabled.mockRejectedValue(new Error('Service error'));
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSetAddressBookServiceEnabled(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(false));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('Service error');
	});
});
