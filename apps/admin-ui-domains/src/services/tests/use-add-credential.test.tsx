/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAddCredential = vi.hoisted(() => vi.fn());

vi.mock('../add-credential', () => ({
	addCredential: mockAddCredential,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useAddCredential } from '../use-add-credential';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const INPUT = { label: 'mobile', services: 'imap' };

describe('useAddCredential', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service, return the response and invalidate the credential list', async () => {
		const response = {
			ok: true,
			response: { list: { label: 'mobile' }, text_data: { password: 'secret' } },
		};
		mockAddCredential.mockResolvedValue(response);
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useAddCredential('jane@example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockAddCredential).toHaveBeenCalledWith('jane@example.com', 'mobile', 'imap');
		expect(result.current.data).toEqual(response);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.credentialList('jane@example.com'),
		});
	});

	it('should throw when the response reports failure', async () => {
		mockAddCredential.mockResolvedValue({ ok: false });
		const { result } = renderHook(() => useAddCredential('jane@example.com'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBeInstanceOf(Error);
	});

	it('should surface service errors', async () => {
		mockAddCredential.mockRejectedValue(new Error('boom'));
		const { result } = renderHook(() => useAddCredential('jane@example.com'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('boom');
	});
});
