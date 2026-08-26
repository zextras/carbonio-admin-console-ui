/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../otp-service', () => ({
	generateTotp: vi.fn(),
	deleteTotp: vi.fn(),
	restoreTotp: vi.fn(),
}));

import { domainQueryKeys } from '../domain-query-keys';
import { deleteTotp, generateTotp, restoreTotp } from '../otp-service';
import { useDeleteTotp, useGenerateTotp, useRestoreTotp } from '../use-otp-mutations';

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

describe('useOtpMutations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const account = 'user@example.com';

	it('useGenerateTotp calls generateTotp for the account and invalidates the OTP list', async () => {
		vi.mocked(generateTotp).mockResolvedValue({ ok: true, response: { secret: 'abc' } });

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useGenerateTotp(), { wrapper });

		result.current.mutate({ account });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(generateTotp).toHaveBeenCalledWith(account);
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.otpList(account) });
	});

	it('useDeleteTotp calls deleteTotp with the OTP id and invalidates the OTP list', async () => {
		vi.mocked(deleteTotp).mockResolvedValue({ ok: true });

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useDeleteTotp(account), { wrapper });

		result.current.mutate({ id: 'otp-1' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(deleteTotp).toHaveBeenCalledWith(account, 'otp-1');
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.otpList(account) });
	});

	it('useRestoreTotp calls restoreTotp with the OTP id and invalidates the OTP list', async () => {
		vi.mocked(restoreTotp).mockResolvedValue({ ok: true });

		const { wrapper, queryClient } = createWrapper();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useRestoreTotp(account), { wrapper });

		result.current.mutate({ id: 'otp-1' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(restoreTotp).toHaveBeenCalledWith(account, 'otp-1');
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.otpList(account) });
	});
});
