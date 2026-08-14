/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { AppView } from '../app-view';

describe('Operations AppView', () => {
	it('redirects the index route to the running tab and renders the layout', async () => {
		setupBrowserTest(<AppView />, { initialRouterEntry: '/' });

		// Breadcrumb renders
		await expect.element(page.getByText('Home')).toBeVisible();

		// Index redirect lands on the operations list (Running/Queued/Done tabs)
		await expect.element(page.getByText('Running', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Queued')).toBeVisible();
		await expect.element(page.getByText('Done')).toBeVisible();
	});
});
