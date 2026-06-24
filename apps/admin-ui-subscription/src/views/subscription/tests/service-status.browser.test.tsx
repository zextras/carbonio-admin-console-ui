/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ServiceStatus } from '../service-status';
import type { AllModuleConfig } from '../subscription';

const setupTest = (component: React.ReactElement) => {
	const queryClient = getQueryClient();
	return setupBrowserTest(component, { queryClient });
};

describe('ServiceStatus', () => {
	it('renders the module label and value', async () => {
		const data: AllModuleConfig = {
			name: { value: 'Realtime', label: 'Backup' },
			quantity: '100',
			enabled: true,
		};
		setupTest(<ServiceStatus data={data} />);

		await expect.element(page.getByText('Backup', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Realtime', { exact: true })).toBeVisible();
	});

	it('shows the user count when quantity is not unlimited', async () => {
		const data: AllModuleConfig = {
			name: { value: 'Realtime', label: 'Backup' },
			quantity: '100',
			enabled: true,
		};
		setupTest(<ServiceStatus data={data} />);

		await expect.element(page.getByText('100 users')).toBeVisible();
	});

	it('shows "Enabled" when quantity is unlimited and the module is enabled', async () => {
		const data: AllModuleConfig = {
			name: { value: 'Basic', label: 'Files' },
			quantity: 'unlimited',
			enabled: true,
		};
		setupTest(<ServiceStatus data={data} />);

		await expect.element(page.getByText('Enabled', { exact: true })).toBeVisible();
	});

	it('shows "Disabled" when quantity is unlimited and the module is disabled', async () => {
		const data: AllModuleConfig = {
			name: { value: 'Basic', label: 'Files' },
			quantity: 'unlimited',
			enabled: false,
		};
		setupTest(<ServiceStatus data={data} />);

		await expect.element(page.getByText('Disabled', { exact: true })).toBeVisible();
	});
});
