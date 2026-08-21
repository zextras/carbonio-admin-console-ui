/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDeleteCredential = vi.hoisted(() => vi.fn());

vi.mock('../delete-credential', () => ({
	deleteCredential: mockDeleteCredential,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useDeleteCredential } from '../use-delete-credential';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useDeleteCredential', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service and invalidate the credential list', async () => {
		mockDeleteCredential.mockResolvedValue({ ok: true });
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useDeleteCredential('jane@example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ passwordId: 'cred-1' }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockDeleteCredential).toHaveBeenCalledWith('jane@example.com', 'cred-1');
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.credentialList('jane@example.com'),
		});
	});

	it('should throw when the response reports failure', async () => {
		mockDeleteCredential.mockResolvedValue({ ok: false });
		const { result } = renderHook(() => useDeleteCredential('jane@example.com'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await act(async () => result.current.mutate({ passwordId: 'cred-1' }));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBeInstanceOf(Error);
	});

	it('should surface service errors', async () => {
		mockDeleteCredential.mockRejectedValue(new Error('boom'));
		const { result } = renderHook(() => useDeleteCredential('jane@example.com'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await act(async () => result.current.mutate({ passwordId: 'cred-1' }));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('boom');
	});
});
