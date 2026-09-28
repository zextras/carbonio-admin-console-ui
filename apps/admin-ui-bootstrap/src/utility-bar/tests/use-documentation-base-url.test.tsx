/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createAPIInterceptor, createSoapAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
	return {
		...actual,
		useCurrentRoute: vi.fn(),
		useRelativePathname: vi.fn(),
	};
});

import { useCurrentRoute, useRelativePathname } from '@zextras/ui-shared';

import { useDocumentationBaseUrl } from '../use-documentation-base-url';

const mockRoute = (route: string): void => {
	vi.mocked(useCurrentRoute).mockReturnValue({
		id: route,
		route,
		path: `manage/${route}`,
		app: 'test',
	} as never);
};

const mockGlobalConfig = (globalUrl: string | undefined): void => {
	createAPIInterceptor('post', '/service/admin/soap/GetAllConfigRequest', () =>
		HttpResponse.json({
			Body: {
				GetAllConfigResponse: {
					a: globalUrl
						? [{ n: 'carbonioAdminDocumentationUrl', _content: globalUrl }]
						: [],
				},
			},
		}),
	);
};

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useDocumentationBaseUrl', () => {
	it('uses the domain override when the current domain has one set, requesting applyConfig: 0', async () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domain-1/general_settings');
		mockGlobalConfig('https://global.example.com/');
		const getDomainParams = createSoapAPIInterceptor('GetDomain', {
			domain: [
				{ a: [{ n: 'carbonioAdminDocumentationUrl', _content: 'https://domain.example.com/' }] },
			],
		});

		const { result } = renderHook(() => useDocumentationBaseUrl(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current).toBe('https://domain.example.com/'));
		expect(await getDomainParams).toMatchObject({ applyConfig: 0 });
	});

	it('falls back to the Global value when the domain has no override', async () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domain-1/general_settings');
		mockGlobalConfig('https://global.example.com/');
		createSoapAPIInterceptor('GetDomain', { domain: [{ a: [] }] });

		const { result } = renderHook(() => useDocumentationBaseUrl(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current).toBe('https://global.example.com/'));
	});

	it('falls back to the Global value outside a domain page', async () => {
		mockRoute('cos');
		vi.mocked(useRelativePathname).mockReturnValue('/some-cos-id/features');
		mockGlobalConfig('https://global.example.com/');

		const { result } = renderHook(() => useDocumentationBaseUrl(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current).toBe('https://global.example.com/'));
	});

	it('falls back to the Global value on the domains list and global section', async () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domains');
		mockGlobalConfig('https://global.example.com/');

		const { result } = renderHook(() => useDocumentationBaseUrl(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current).toBe('https://global.example.com/'));
	});

	it('falls back to the default when neither domain nor Global is set', async () => {
		mockRoute('cos');
		vi.mocked(useRelativePathname).mockReturnValue('/');
		mockGlobalConfig(undefined);

		const { result } = renderHook(() => useDocumentationBaseUrl(), { wrapper: createWrapper() });

		await waitFor(() =>
			expect(result.current).toBe('https://docs.zextras.com/help-carbonio?'),
		);
	});

	it('ignores an empty-string domain override and falls back to Global', async () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domain-1/general_settings');
		mockGlobalConfig('https://global.example.com/');
		createSoapAPIInterceptor('GetDomain', {
			domain: [{ a: [{ n: 'carbonioAdminDocumentationUrl', _content: '' }] }],
		});

		const { result } = renderHook(() => useDocumentationBaseUrl(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current).toBe('https://global.example.com/'));
	});
});
