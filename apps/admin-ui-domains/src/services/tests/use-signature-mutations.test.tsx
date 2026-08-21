/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateSignature = vi.hoisted(() => vi.fn());
const mockDeleteSignature = vi.hoisted(() => vi.fn());
const mockModifySignature = vi.hoisted(() => vi.fn());

vi.mock('../create-signature-service', () => ({
	createSignature: mockCreateSignature,
}));
vi.mock('../delete-signature-service', () => ({
	deleteSignature: mockDeleteSignature,
}));
vi.mock('../modify-signature-service', () => ({
	modifySignature: mockModifySignature,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useCreateSignature, useDeleteSignature, useModifySignature } from '../use-signature-mutations';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('signature mutations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('useCreateSignature', () => {
		it('should call the service and invalidate the signatures query', async () => {
			mockCreateSignature.mockResolvedValue({ Body: { CreateSignatureResponse: {} } });
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useCreateSignature('account-1'), {
				wrapper: makeWrapper(queryClient),
			});

			await act(async () => result.current.mutate({ name: 'sig', content: 'hello' }));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockCreateSignature).toHaveBeenCalledWith('account-1', 'sig', 'hello');
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.accountSignatures('account-1'),
			});
		});

		it('should surface service errors', async () => {
			mockCreateSignature.mockRejectedValue(new Error('boom'));
			const { result } = renderHook(() => useCreateSignature('account-1'), {
				wrapper: makeWrapper(new QueryClient()),
			});

			await act(async () => result.current.mutate({ name: 'sig', content: 'hello' }));
			await waitFor(() => expect(result.current.isError).toBe(true));
			expect((result.current.error as Error).message).toBe('boom');
		});
	});

	describe('useDeleteSignature', () => {
		it('should call the service for each id and invalidate the signatures query', async () => {
			mockDeleteSignature.mockResolvedValue({ Body: { DeleteSignatureResponse: {} } });
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useDeleteSignature('account-1'), {
				wrapper: makeWrapper(queryClient),
			});

			await act(async () => result.current.mutate({ signatureIds: ['sig-1', 'sig-2'] }));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockDeleteSignature).toHaveBeenCalledWith('account-1', 'sig-1');
			expect(mockDeleteSignature).toHaveBeenCalledWith('account-1', 'sig-2');
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.accountSignatures('account-1'),
			});
		});

		it('should surface service errors', async () => {
			mockDeleteSignature.mockRejectedValue(new Error('boom'));
			const { result } = renderHook(() => useDeleteSignature('account-1'), {
				wrapper: makeWrapper(new QueryClient()),
			});

			await act(async () => result.current.mutate({ signatureIds: ['sig-1'] }));
			await waitFor(() => expect(result.current.isError).toBe(true));
		});
	});

	describe('useModifySignature', () => {
		it('should call the service and invalidate the signatures query', async () => {
			mockModifySignature.mockResolvedValue({ Body: { ModifySignatureResponse: {} } });
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useModifySignature('account-1'), {
				wrapper: makeWrapper(queryClient),
			});

			await act(async () =>
				result.current.mutate({ signatureId: 'sig-1', name: 'renamed', content: 'new' }),
			);
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockModifySignature).toHaveBeenCalledWith('account-1', 'sig-1', 'renamed', 'new');
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.accountSignatures('account-1'),
			});
		});

		it('should surface service errors', async () => {
			mockModifySignature.mockRejectedValue(new Error('boom'));
			const { result } = renderHook(() => useModifySignature('account-1'), {
				wrapper: makeWrapper(new QueryClient()),
			});

			await act(async () =>
				result.current.mutate({ signatureId: 'sig-1', name: 'renamed', content: 'new' }),
			);
			await waitFor(() => expect(result.current.isError).toBe(true));
		});
	});
});
