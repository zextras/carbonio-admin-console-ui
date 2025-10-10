/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';


import MTAAdvanced from '../mta-advanced/mta-advanced';

function expectGeneralOptionsSectionVisible() {
	// expect(page.getByText('General Options')).toBeVisible();
	// expect(page.getByText('English - English')).toBeVisible();
	// expect(page.getByText('Language')).toBeVisible();
}

function expectMailOptionsSectionVisible() {
	// expect(page.getByText('Mail Options')).toBeVisible();
	// expect(page.getByText('View mail as HTML (when possible)')).toBeVisible();
	// expect(page.getByText('Display by')).toBeVisible();
	// expect(page.getByText('Message', { exact: true })).toBeVisible();
	// expect(page.getByText('Default Charset')).toBeVisible();
	// expect(page.getByText('Big5')).toBeVisible();
	// expect(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
	// expect(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
	// expect(page.getByText('Maximum size (bytes) allowed for each attachment')).toBeVisible();
	// expect(page.getByText('~2 GB')).toBeVisible();
}

function expectReceivingMailsSectionVisible() {
	// expect(page.getByText('Receiving Mails')).toBeVisible();
	// expect(page.getByText('Minimum mail polling interval')).toBeVisible();
	// expect(page.getByText('Days / Hours / Minutes / Sec')).toBeVisible();
	// expect(page.getByText('Polling interval', { exact: true })).toBeVisible();
}

describe('COSPreferences', () => {
	const setupCosStore = (): void => {
		// useCosStore.getState().setCos({
		// 	id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
		// 	name: 'default',
		// 	isDefaultCos: true,
		// 	a: [
		// 		{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
		// 		{ n: 'zimbraPrefLocale', _content: 'en' },
		// 		{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' }
		// 	]
		// });
	};

	const setupRightsStore = (): void => {
		// useRightsStore.getState().setRights([
		// 	{
		// 		type: 'cos',
		// 		all: [
		// 			{
		// 				right: [
		// 					{ n: 'assignCos' },
		// 					{ n: 'deleteCos' },
		// 					{ n: 'listCos' },
		// 					{ n: 'manageZimlet' },
		// 					{ n: 'renameCos' }
		// 				],
		// 				setAttrs: [{ all: true }],
		// 				getAttrs: [{ all: true }]
		// 			}
		// 		]
		// 	}
		// ]);
	};

	beforeEach(() => {
		vi.resetAllMocks();
		// setupCosStore();
		// setupRightsStore();
	});

	it('should render the component correctly', async () => {
		setupBrowserTest(<MTAAdvanced />);
		await expect.element(page.getByText('Advanced 1')).toBeVisible();
		// expectGeneralOptionsSectionVisible();
		// expectMailOptionsSectionVisible();
		// expectReceivingMailsSectionVisible();
		
	});
});
