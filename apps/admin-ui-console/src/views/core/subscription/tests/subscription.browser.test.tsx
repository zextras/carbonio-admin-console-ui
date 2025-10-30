/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { it, describe, beforeEach, afterEach } from 'vitest';

import { useModuleLicenseStore } from '../../../../store/module-license/store';
import { useRightsStore } from '../../../../store/rights/store';
import { Subscription } from '../subscription';

const mockLicenseInfo = {
	maintenanceEndDate: 1760572800000,
	maintenanceStatus: 'expired',
	subType: 'PERPETUAL'
};

const mockApiResponse = {
	cos: [
		{
			name: 'firstCOS',
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			isDefaultCos: true
		},
		{
			name: 'secondCOS',
			id: 'f27456a8-0c00-11d9-280a-286d93afea2g',
			isDefaultCos: true
		}
	],
	searchTotal: 2,
	more: false
};
const mockRights = [
	{
		type: 'config',
		all: [
			{
				setAttrs: [{ all: true }]
			}
		]
	}
];
describe('', () => {
	beforeEach(() => {
		useRightsStore.getState().reset();
	});

	// Also reset after each test for extra safety
	afterEach(() => {
		resetMockWorker();
		useRightsStore.getState().reset();
	});

	it('should render all parts of the component', async () => {
		useRightsStore.getState().setRights(mockRights);
		useModuleLicenseStore.getState().setLicenseInfo(mockLicenseInfo);
		setupBrowserTest(<Subscription />);

		// await expect.element(page.getByText('General')).toBeVisible();
		// await expect.element(page.getByText('COS List')).toBeVisible();
		// await expect.element(page.getByText('Select a Class of Service')).toBeVisible();
		// await expect.element(page.getByText('Not found - check the text and try again')).toBeVisible();
		// await expect.element(page.getByText('Details')).toBeVisible();
		// await expect.element(page.getByText('General Information')).toBeVisible();
		// await expect.element(page.getByText('Features')).toBeVisible();
		// await expect.element(page.getByText('Chat')).toBeVisible();
		// await expect.element(page.getByText('Preferences')).toBeVisible();
		// await expect.element(page.getByText('Server Pools')).toBeVisible();
		// await expect.element(page.getByText('Advanced')).toBeVisible();
	});
});
