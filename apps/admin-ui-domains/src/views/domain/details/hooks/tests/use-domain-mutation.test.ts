/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@zextras/ui-components', () => ({
	useSnackbar: () => mockCreateSnackbar
}));

vi.mock('@tanstack/react-query', () => ({
	useQueryClient: () => ({
		invalidateQueries: mockInvalidateQueries
	})
}));

vi.mock('react-router', () => ({
	useParams: () => ({ domainId: 'test-domain-id' })
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [(key: string, fallback: string) => fallback]
}));

vi.mock('@zextras/ui-shared', () => ({
	domainByIdKey: (id: string, version: number) => ['domain', id, version]
}));

import { useDomainMutation } from '../use-domain-mutation';

describe('useDomainMutation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns isPending false initially', () => {
		const { result } = renderHook(() =>
			useDomainMutation({
				mutationFn: vi.fn()
			})
		);

		expect(result.current.isPending).toBe(false);
	});

	describe('successful mutation', () => {
		it('calls mutationFn with provided variables', async () => {
			const mutationFn = vi.fn().mockResolvedValue({ success: true });
			const { result } = renderHook(() =>
				useDomainMutation({ mutationFn })
			);

			await act(async () => {
				await result.current.mutate({ data: 'test' });
			});

			expect(mutationFn).toHaveBeenCalledWith({ data: 'test' });
		});

		it('shows success snackbar after mutation', async () => {
			const mutationFn = vi.fn().mockResolvedValue({ success: true });
			const { result } = renderHook(() =>
				useDomainMutation({ mutationFn })
			);

			await act(async () => {
				await result.current.mutate({ data: 'test' });
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success'
				})
			);
		});

		it('uses custom success message when provided', async () => {
			const mutationFn = vi.fn().mockResolvedValue({ success: true });
			const { result } = renderHook(() =>
				useDomainMutation({
					mutationFn,
					successMessage: 'Custom success!'
				})
			);

			await act(async () => {
				await result.current.mutate({ data: 'test' });
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					label: 'Custom success!'
				})
			);
		});

		it('invalidates domain query after success', async () => {
			const mutationFn = vi.fn().mockResolvedValue({ success: true });
			const { result } = renderHook(() =>
				useDomainMutation({ mutationFn })
			);

			await act(async () => {
				await result.current.mutate({ data: 'test' });
			});

			expect(mockInvalidateQueries).toHaveBeenCalledWith({
				queryKey: ['domain', 'test-domain-id', 1]
			});
		});

		it('returns the mutation result', async () => {
			const mutationFn = vi.fn().mockResolvedValue({ id: 123 });
			const { result } = renderHook(() =>
				useDomainMutation({ mutationFn })
			);

			let returnedResult: unknown;
			await act(async () => {
				returnedResult = await result.current.mutate({ data: 'test' });
			});

			expect(returnedResult).toEqual({ id: 123 });
		});
	});

	describe('failed mutation', () => {
		it('shows error snackbar with error message', async () => {
			const mutationFn = vi.fn().mockRejectedValue(new Error('API failed'));
			const { result } = renderHook(() =>
				useDomainMutation({ mutationFn })
			);

			await act(async () => {
				await result.current.mutate({ data: 'test' });
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					label: 'API failed'
				})
			);
		});

		it('returns undefined on error', async () => {
			const mutationFn = vi.fn().mockRejectedValue(new Error('API failed'));
			const { result } = renderHook(() =>
				useDomainMutation({ mutationFn })
			);

			let returnedResult: unknown;
			await act(async () => {
				returnedResult = await result.current.mutate({ data: 'test' });
			});

			expect(returnedResult).toBeUndefined();
		});
	});

	describe('isPending state', () => {
		it('sets isPending to true during mutation', async () => {
			let resolvePromise: (value: unknown) => void;
			const mutationFn = vi.fn().mockImplementation(
				() => new Promise((resolve) => { resolvePromise = resolve; })
			);

			const { result } = renderHook(() =>
				useDomainMutation({ mutationFn })
			);

			expect(result.current.isPending).toBe(false);

			let mutatePromise: Promise<unknown>;
			act(() => {
				mutatePromise = result.current.mutate({ data: 'test' });
			});

			await waitFor(() => {
				expect(result.current.isPending).toBe(true);
			});

			await act(async () => {
				resolvePromise!({ success: true });
				await mutatePromise;
			});

			expect(result.current.isPending).toBe(false);
		});
	});
});
