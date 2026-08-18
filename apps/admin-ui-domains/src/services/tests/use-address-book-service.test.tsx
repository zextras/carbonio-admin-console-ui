/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAddressBookServices = vi.hoisted(() => vi.fn());

vi.mock('../get-address-book-services', () => ({
	getAddressBookServices: mockGetAddressBookServices,
}));

import { useAddressBookServiceStatus } from '../use-address-book-service';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const RUNNING = { running: true, couldStart: false, couldStop: true };

describe('useAddressBookServiceStatus', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return the parsed service status', async () => {
		mockGetAddressBookServices.mockResolvedValue(RUNNING);

		const { result } = renderHook(() => useAddressBookServiceStatus(), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.data).toEqual(RUNNING));
	});

	it('should expose the error when the service throws', async () => {
		mockGetAddressBookServices.mockRejectedValue(new Error('Service error'));

		const { result } = renderHook(() => useAddressBookServiceStatus(), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect(result.current.error?.message).toBe('Service error');
	});
});
