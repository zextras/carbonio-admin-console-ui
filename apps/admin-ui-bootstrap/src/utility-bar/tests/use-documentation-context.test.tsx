/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
	useCurrentRoute: vi.fn(),
	useRelativePathname: vi.fn(),
}));

import { useCurrentRoute, useRelativePathname } from '@zextras/ui-shared';

import { useDocumentationContext } from '../use-documentation-context';

const mockRoute = (route: string, path: string): void => {
	vi.mocked(useCurrentRoute).mockReturnValue({ id: route, route, path, app: 'test' } as never);
};

describe('useDocumentationContext', () => {
	it('returns the default context when there is no current route', () => {
		vi.mocked(useCurrentRoute).mockReturnValue(undefined);
		vi.mocked(useRelativePathname).mockReturnValue('/');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'admin', moduleLabelKey: 'label.admin', moduleLabelFallback: 'Admin' });
	});

	it('returns the default context when the route has no mapping', () => {
		mockRoute('unmapped-app', 'manage/unmapped-app');
		vi.mocked(useRelativePathname).mockReturnValue('/');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'admin', moduleLabelKey: 'label.admin', moduleLabelFallback: 'Admin' });
	});

	it('resolves module and context for a route with no subpaths', () => {
		mockRoute('privacy', 'privacy');
		vi.mocked(useRelativePathname).mockReturnValue('/');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'privacy', context: undefined, moduleLabelKey: 'label.privacy', moduleLabelFallback: 'Privacy' });
	});

	it('resolves a domain-level subpath (general_settings)', () => {
		mockRoute('domains', 'manage/domains');
		vi.mocked(useRelativePathname).mockReturnValue('/some-domain-id/general_settings');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'domains', context: 'general', moduleLabelKey: 'label.domains', moduleLabelFallback: 'Domains' });
	});

	it('resolves the global section with its specific subpath (administrators)', () => {
		mockRoute('domains', 'manage/domains');
		vi.mocked(useRelativePathname).mockReturnValue('/global/administrators');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'domains', context: 'admins', moduleLabelKey: 'label.domains', moduleLabelFallback: 'Domains' });
	});

	it('falls back to the generic global context when no specific subpath matches', () => {
		mockRoute('domains', 'manage/domains');
		vi.mocked(useRelativePathname).mockReturnValue('/global');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'domains', context: 'global', moduleLabelKey: 'label.domains', moduleLabelFallback: 'Domains' });
	});

	it('maps the accounts subpath to the account context', () => {
		mockRoute('domains', 'manage/domains');
		vi.mocked(useRelativePathname).mockReturnValue('/some-domain-id/accounts');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'domains', context: 'account', moduleLabelKey: 'label.domains', moduleLabelFallback: 'Domains' });
	});

	it('maps active_sync and address_book to the manage fallback context', () => {
		mockRoute('domains', 'manage/domains');
		vi.mocked(useRelativePathname).mockReturnValue('/some-domain-id/address_book');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'domains', context: 'manage', moduleLabelKey: 'label.domains', moduleLabelFallback: 'Domains' });
	});

	it('resolves a nested COS subpath regardless of the dynamic :cosId segment', () => {
		mockRoute('cos', 'manage/cos');
		vi.mocked(useRelativePathname).mockReturnValue('/some-cos-id/features');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'cos', context: 'features', moduleLabelKey: 'label.cos', moduleLabelFallback: 'COS' });
	});

	it('resolves an MTA server-scoped subpath regardless of the dynamic :server segment', () => {
		mockRoute('mail_transfer_agent', 'manage/mail_transfer_agent');
		vi.mocked(useRelativePathname).mockReturnValue('/some-server/mta_server_general');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'mta', context: 'server-general', moduleLabelKey: 'label.mail_trans_agent', moduleLabelFallback: 'Mail Trans. Agent' });
	});

	it('resolves a Storage subpath', () => {
		mockRoute('storage', 'manage/storage');
		vi.mocked(useRelativePathname).mockReturnValue('/data_volumes');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'storage', context: 'data-volumes', moduleLabelKey: 'label.storage', moduleLabelFallback: 'Storage' });
	});

	it('resolves a Backup subpath', () => {
		mockRoute('backup', 'services/backup');
		vi.mocked(useRelativePathname).mockReturnValue('/server_config');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'backup', context: 'server-config', moduleLabelKey: 'label.backup', moduleLabelFallback: 'Backup' });
	});

	it('falls back to undefined context on an unmapped subpath within a known app', () => {
		mockRoute('cos', 'manage/cos');
		vi.mocked(useRelativePathname).mockReturnValue('/some-cos-id/unmapped-tab');

		const { result } = renderHook(() => useDocumentationContext());

		expect(result.current).toEqual({ module: 'cos', context: undefined, moduleLabelKey: 'label.cos', moduleLabelFallback: 'COS' });
	});

	it('memoizes the result and recomputes only when route or path change', () => {
		mockRoute('privacy', 'privacy');
		vi.mocked(useRelativePathname).mockReturnValue('/');

		const { result, rerender } = renderHook(() => useDocumentationContext());
		const first = result.current;
		rerender();

		expect(result.current).toBe(first);
	});
});
