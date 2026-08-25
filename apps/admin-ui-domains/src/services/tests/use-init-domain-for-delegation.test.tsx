/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
	useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../init-domain-for-delegation', () => ({
	InitDomainForDelegation: vi.fn(),
}));

import { useSnackbar } from '@zextras/ui-components';

import { InitDomainForDelegation } from '../init-domain-for-delegation';
import { useInitDomainForDelegation } from '../use-init-domain-for-delegation';

const mockCreateSnackbar = vi.fn();

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

describe('useInitDomainForDelegation', () => {
	beforeEach(() => {
		vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
		mockCreateSnackbar.mockClear();
	});

	it('should call InitDomainForDelegation with the admin urn and domain on mutate', async () => {
		vi.mocked(InitDomainForDelegation).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInitDomainForDelegation(), { wrapper });

		result.current.mutate({ domain: 'example.com' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(InitDomainForDelegation).toHaveBeenCalledWith('/admin/initDomainForDelegation', {
			_jsns: 'urn:zimbraAdmin',
			domain: 'example.com'
		});
	});

	it('should show a success snackbar with the response message when present', async () => {
		vi.mocked(InitDomainForDelegation).mockResolvedValue({ message: 'Delegation initialized' });

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInitDomainForDelegation(), { wrapper });

		result.current.mutate({ domain: 'example.com' });

		await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'success',
				label: 'Delegation initialized'
			})
		);
	});

	it('should show the fallback success message when the response has no message', async () => {
		vi.mocked(InitDomainForDelegation).mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInitDomainForDelegation(), { wrapper });

		result.current.mutate({ domain: 'example.com' });

		await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'success',
				label: 'Changes have been saved successfully'
			})
		);
	});

	it('should show an error snackbar with the error message when rejected', async () => {
		vi.mocked(InitDomainForDelegation).mockRejectedValue(new Error('Delegation failed'));

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInitDomainForDelegation(), { wrapper });

		result.current.mutate({ domain: 'example.com' });

		await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'error',
				label: 'Delegation failed'
			})
		);
	});

	it('should show the generic error message when the error has no message', async () => {
		vi.mocked(InitDomainForDelegation).mockRejectedValue(new Error());

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useInitDomainForDelegation(), { wrapper });

		result.current.mutate({ domain: 'example.com' });

		await waitFor(() => expect(mockCreateSnackbar).toHaveBeenCalledTimes(1));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'error',
				label: 'Something went wrong. Please try again.'
			})
		);
	});
});
