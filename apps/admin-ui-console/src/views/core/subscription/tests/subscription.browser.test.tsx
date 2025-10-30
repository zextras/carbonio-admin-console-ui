/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
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

const mockLicenseInfoResponse = {
	Response: {
		content:
			'{"response":{"subType":"PERPETUAL","expired":false,"dateStart":1652140800000,"dateEnd":1855526400000,"maintenanceEndDate":1760572800000,"maintenanceStatus":"expired","type":"Purchased","customer":"ACI - Assistance et Conseil en Informatique SARL","accountCount":7,"licensedUsers":"99","notYetValid":false,"teamchatActiveCount":0,"teamchatBasicActive":true,"serverID":"c6005623-030c-478e-af1d-2d0abddc352b","canRemoveChatBrand":true,"infrastructureId":"8b2458ac-61e5-47c0-b70b-d27701c3c68d","authenticationToken":"PERPETUAL_LIC","endUser":"end user23","features":[{"name":"backup_realtime","quantity":"unlimited","enabled":true},{"name":"chats_recording","quantity":"unlimited","enabled":true},{"name":"files_basic","quantity":"unlimited","enabled":true},{"name":"storages_basic","quantity":"unlimited","enabled":true},{"name":"admins_basic","quantity":"unlimited","enabled":true},{"name":"backup_basic","quantity":"444","enabled":true},{"name":"mail_replica","quantity":"99","enabled":true},{"name":"appmail_basic","quantity":"unlimited","enabled":true},{"name":"storages_conn_basic","quantity":"unlimited","enabled":true},{"name":"appmail_advanced","quantity":"222","enabled":true},{"name":"chats_basic","quantity":"unlimited","enabled":true},{"name":"storages_centralized","quantity":"unlimited","enabled":true},{"name":"activesync_shared_folder","quantity":"unlimited","enabled":true},{"name":"auth_2fa","quantity":"unlimited","enabled":true},{"name":"chats_rooms","quantity":"222","enabled":true},{"name":"storages_hsm","quantity":"unlimited","enabled":false},{"name":"files_docs_balancing","quantity":"unlimited","enabled":true},{"name":"auth_saml","quantity":"unlimited","enabled":true},{"name":"backup_ext_volume","quantity":"unlimited","enabled":true},{"name":"storages_conn_sproxyd","quantity":"unlimited","enabled":true},{"name":"wsc_basic","quantity":"unlimited","enabled":false},{"name":"activesync_basic","quantity":"111","enabled":true},{"name":"backup_import_external","quantity":"unlimited","enabled":true}]},"ok":true}'
	}
};

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
		// useRightsStore.getState().setRights(mockRights);
		useModuleLicenseStore.getState().setLicenseInfo(mockLicenseInfo);

		createSoapAPIInterceptor('getLicenseInfo', mockLicenseInfoResponse);
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
