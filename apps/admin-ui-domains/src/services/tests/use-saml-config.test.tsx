/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSamlConfig = vi.hoisted(() => vi.fn());

vi.mock('../get-saml-configurations', () => ({
	getSamlConfig: mockGetSamlConfig,
}));

import { useSamlConfig } from '../use-saml-config';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useSamlConfig', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch raw config for the domain', async () => {
		mockGetSamlConfig.mockResolvedValue({ attr1: 'value1' });

		const { result } = renderHook(() => useSamlConfig('example.com'), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.data).toEqual({ attr1: 'value1' }));
		expect(mockGetSamlConfig).toHaveBeenCalledWith('example.com', true);
	});

	it('should throw when the response carries an error', async () => {
		mockGetSamlConfig.mockResolvedValue({ error: 'not found' });

		const { result } = renderHook(() => useSamlConfig('example.com'), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect(result.current.error?.message).toBe('not found');
	});

	it('should stay disabled while the domain is empty', async () => {
		mockGetSamlConfig.mockResolvedValue({});

		const { result } = renderHook(() => useSamlConfig(''), {
			wrapper: QueryWrapper,
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetSamlConfig).not.toHaveBeenCalled();
	});
});
