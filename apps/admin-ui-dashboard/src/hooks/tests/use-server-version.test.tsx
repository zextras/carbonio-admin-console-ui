/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { useServerVersion } from '../use-server-version';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
		},
	});
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useServerVersion', () => {
	it('returns the fetched version string on success', async () => {
		createAPIInterceptor('get', '/.version', () =>
			HttpResponse.text('25.1.0', { status: 200 }),
		);

		const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.serverVersion).toBe('25.1.0');
	});

	it('trims whitespace from the version string', async () => {
		createAPIInterceptor('get', '/.version', () =>
			HttpResponse.text('  25.1.0  \n', { status: 200 }),
		);

		const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.serverVersion).toBe('25.1.0');
	});

	it('returns empty string on HTTP error', async () => {
		createAPIInterceptor('get', '/.version', () =>
			HttpResponse.text('Internal Server Error', { status: 500 }),
		);

		const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
		expect(result.current.serverVersion).toBe('');
	});

	it('returns empty string on network error', async () => {
		createAPIInterceptor('get', '/.version', () => HttpResponse.error());

		const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
		expect(result.current.serverVersion).toBe('');
	});

	it('isLoading is true initially and false after fetch', async () => {
		createAPIInterceptor('get', '/.version', () =>
			HttpResponse.text('25.1.0', { status: 200 }),
		);

		const { result } = renderHook(() => useServerVersion(), { wrapper: createWrapper() });

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.serverVersion).toBe('25.1.0');
	});
});
