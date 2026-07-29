/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createBrowserSoapAPIInterceptor, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { AppView } from '../app-view';

describe('LegalHold AppView', () => {
	it('renders the breadcrumb and the legal hold panel', async () => {
		createBrowserSoapAPIInterceptor('GetInfo', {
			name: 'admin@test.com',
			id: 'admin-id',
			attrs: { _attrs: {} },
			prefs: { _attrs: {} },
			props: { prop: [] },
		});
		createBrowserSoapAPIInterceptor('GetDomain', {
			domain: [
				{ id: 'domain-1', name: 'test.com', a: [{ n: 'zimbraDomainName', _content: 'test.com' }] },
			],
		});
		createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
			grantee: { id: 'test-id', name: 'admin@test.com' },
			target: [],
		});
		createBrowserSoapAPIInterceptor('SearchDirectory', { domain: [], searchTotal: 0, more: false });
		worker.use(
			http.get('/service/extension/zextras_admin/backup/getBackupAccounts', () =>
				HttpResponse.json({ accounts: [], maxPage: 0 }),
			),
		);

		setupBrowserTest(<AppView />);

		// Breadcrumb + LegalHoldPanel content render inside AppView
		await expect.element(page.getByText('Legal Hold').first()).toBeVisible();
	});
});
