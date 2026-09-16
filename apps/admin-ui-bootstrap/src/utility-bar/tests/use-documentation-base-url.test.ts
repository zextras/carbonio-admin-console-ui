/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
	CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE: 'carbonioAdminDocumentationUrl',
	DEFAULT_ADVANCED_DOCUMENTATION_URL: 'https://docs.zextras.com/help-carbonio?',
	useConfigAttribute: vi.fn(),
	useCurrentRoute: vi.fn(),
	useDomainById: vi.fn(),
	useRelativePathname: vi.fn(),
}));

import {
	useConfigAttribute,
	useCurrentRoute,
	useDomainById,
	useRelativePathname,
} from '@zextras/ui-shared';

import { useDocumentationBaseUrl } from '../use-documentation-base-url';

const mockRoute = (route: string): void => {
	vi.mocked(useCurrentRoute).mockReturnValue({
		id: route,
		route,
		path: `manage/${route}`,
		app: 'test',
	} as never);
};

describe('useDocumentationBaseUrl', () => {
	it('uses the domain override when the current domain has one set', () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domain-1/general_settings');
		vi.mocked(useConfigAttribute).mockReturnValue({ data: 'https://global.example.com/' } as never);
		vi.mocked(useDomainById).mockReturnValue({
			data: { a: [{ n: 'carbonioAdminDocumentationUrl', _content: 'https://domain.example.com/' }] },
		} as never);

		const { result } = renderHook(() => useDocumentationBaseUrl());

		expect(result.current).toBe('https://domain.example.com/');
	});

	it('falls back to the Global value when the domain has no override', () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domain-1/general_settings');
		vi.mocked(useConfigAttribute).mockReturnValue({ data: 'https://global.example.com/' } as never);
		vi.mocked(useDomainById).mockReturnValue({ data: { a: [] } } as never);

		const { result } = renderHook(() => useDocumentationBaseUrl());

		expect(result.current).toBe('https://global.example.com/');
	});

	it('falls back to the Global value outside a domain page', () => {
		mockRoute('cos');
		vi.mocked(useRelativePathname).mockReturnValue('/some-cos-id/features');
		vi.mocked(useConfigAttribute).mockReturnValue({ data: 'https://global.example.com/' } as never);
		vi.mocked(useDomainById).mockReturnValue({ data: undefined } as never);

		const { result } = renderHook(() => useDocumentationBaseUrl());

		expect(result.current).toBe('https://global.example.com/');
	});

	it('falls back to the Global value on the domains list and global section', () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domains');
		vi.mocked(useConfigAttribute).mockReturnValue({ data: 'https://global.example.com/' } as never);
		vi.mocked(useDomainById).mockReturnValue({ data: undefined } as never);

		const { result } = renderHook(() => useDocumentationBaseUrl());

		expect(result.current).toBe('https://global.example.com/');
	});

	it('falls back to the default when neither domain nor Global is set', () => {
		mockRoute('cos');
		vi.mocked(useRelativePathname).mockReturnValue('/');
		vi.mocked(useConfigAttribute).mockReturnValue({ data: undefined } as never);
		vi.mocked(useDomainById).mockReturnValue({ data: undefined } as never);

		const { result } = renderHook(() => useDocumentationBaseUrl());

		expect(result.current).toBe('https://docs.zextras.com/help-carbonio?');
	});

	it('ignores an empty-string domain override and falls back to Global', () => {
		mockRoute('domains');
		vi.mocked(useRelativePathname).mockReturnValue('/domain-1/general_settings');
		vi.mocked(useConfigAttribute).mockReturnValue({ data: 'https://global.example.com/' } as never);
		vi.mocked(useDomainById).mockReturnValue({
			data: { a: [{ n: 'carbonioAdminDocumentationUrl', _content: '' }] },
		} as never);

		const { result } = renderHook(() => useDocumentationBaseUrl());

		expect(result.current).toBe('https://global.example.com/');
	});
});
