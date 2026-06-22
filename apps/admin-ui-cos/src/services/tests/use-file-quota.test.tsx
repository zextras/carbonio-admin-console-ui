/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useFileQuota } from '../use-file-quota';

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
  ...(await importOriginal()),
  getFileQuotaById: vi.fn(),
}));

import { getFileQuotaById } from '@zextras/ui-shared';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return Wrapper;
}

describe('useFileQuota', () => {
	it('should not fetch when cosId is undefined', () => {
		const wrapper = createWrapper();
		const { result } = renderHook(() => useFileQuota(undefined, true), { wrapper });

		expect(result.current.fetchStatus).toBe('idle');
		expect(getFileQuotaById).not.toHaveBeenCalled();
	});

	it('should not fetch when enabled is false', () => {
		const wrapper = createWrapper();
		const { result } = renderHook(() => useFileQuota('cos-1', false), { wrapper });

		expect(result.current.fetchStatus).toBe('idle');
		expect(getFileQuotaById).not.toHaveBeenCalled();
	});

	it('should fetch file quota with cos type when cosId and enabled are truthy', async () => {
		const mockResponse = { limit: '4096' };
		vi.mocked(getFileQuotaById).mockResolvedValue(mockResponse);

		const wrapper = createWrapper();
		const { result } = renderHook(() => useFileQuota('cos-1', true), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getFileQuotaById).toHaveBeenCalledWith('cos-1', 'cos');
		expect(result.current.data).toEqual(mockResponse);
	});

	it('should handle fetch errors', async () => {
		vi.mocked(getFileQuotaById).mockRejectedValue(new Error('Network error'));

		const wrapper = createWrapper();
		const { result } = renderHook(() => useFileQuota('cos-err', true), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
