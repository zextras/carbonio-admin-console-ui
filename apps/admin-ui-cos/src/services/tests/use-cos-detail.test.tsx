/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCosDetail } from '../use-cos-detail';

vi.mock('@zextras/ui-shared', () => ({
	getCosGeneralInformation: vi.fn(),
}));

import { getCosGeneralInformation } from '@zextras/ui-shared';

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

describe('useCosDetail', () => {
	it('should not fetch when cosId is undefined', () => {
		const wrapper = createWrapper();
		const { result } = renderHook(() => useCosDetail(undefined), { wrapper });

		expect(result.current.fetchStatus).toBe('idle');
		expect(getCosGeneralInformation).not.toHaveBeenCalled();
	});

	it('should fetch cos detail when cosId is provided', async () => {
		const mockResponse = { cos: [{ id: 'cos-1', name: 'default' }] };
		vi.mocked(getCosGeneralInformation).mockResolvedValue(mockResponse);

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCosDetail('cos-1'), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getCosGeneralInformation).toHaveBeenCalledWith('cos-1');
		expect(result.current.data).toEqual(mockResponse);
	});

	it('should handle fetch errors', async () => {
		vi.mocked(getCosGeneralInformation).mockRejectedValue(new Error('Not found'));

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCosDetail('cos-err'), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
