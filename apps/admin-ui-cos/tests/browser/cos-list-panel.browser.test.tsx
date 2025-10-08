/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { it, describe, expect, vi } from 'vitest';

import { CosListPanel } from '../../src/views/cos/cos-list-panel';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
	soapFetch: vi.fn(),
	replaceHistory: vi.fn()
}));

describe('CosListPanel', () => {
	it('should render all parts of the component', async () => {
		setupBrowserTest(<CosListPanel />, { initialRouterEntries: ['/'] });
		await expect.element(page.getByText('General')).toBeVisible();
		await expect.element(page.getByText('COS List')).toBeVisible();
		await expect.element(page.getByText('Select a Class of Service')).toBeVisible();
		await expect.element(page.getByText('Details')).toBeVisible();
		await expect.element(page.getByText('General Information')).toBeVisible();
		await expect.element(page.getByText('Features')).toBeVisible();
		await expect.element(page.getByText('Chat')).toBeVisible();
		await expect.element(page.getByText('Preferences')).toBeVisible();
		await expect.element(page.getByText('Server Pools')).toBeVisible();
		await expect.element(page.getByText('Advanced')).toBeVisible();
	});
});
