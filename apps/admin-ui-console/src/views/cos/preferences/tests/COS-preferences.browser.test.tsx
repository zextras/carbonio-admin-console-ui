/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCosStore } from '../../../../store/cos/store';
import { useRightsStore } from '../../../../store/rights/store';
import { setup } from '../../../../tests/testUtils';
import { COSPreferences } from '../COSPreferences';

vi.mock('../../../../services/modify-cos-service', () => ({
	modifyCos: vi.fn()
}));

vi.mock('../../../../services/flush-cache-service', () => ({
	flushCache: vi.fn()
}));

describe('COSPreferences', () => {
	const setupCosStore = (): void => {
		useCosStore.getState().setCos({
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			name: 'default',
			isDefaultCos: true,
			a: [
				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
				{ n: 'zimbraPrefLocale', _content: 'en' },
				{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' }
			]
		});
	};

	const setupRightsStore = (): void => {
		useRightsStore.getState().setRights([
			{
				type: 'cos',
				all: [
					{
						right: [
							{ n: 'assignCos' },
							{ n: 'deleteCos' },
							{ n: 'listCos' },
							{ n: 'manageZimlet' },
							{ n: 'renameCos' }
						],
						setAttrs: [{ all: true }],
						getAttrs: [{ all: true }]
					}
				]
			}
		]);
	};

	beforeEach(() => {
		vi.resetAllMocks();
		setupCosStore();
		setupRightsStore();
	});

	it('should render the component correctly', async () => {
		setup(<COSPreferences />);
		// Main heading
		expect(page.getByText('Preferences')).toBeVisible();

		// General Options section
		expect(page.getByText('General Options')).toBeVisible();
		expect(page.getByText('English - English')).toBeVisible();
		expect(page.getByText('Language')).toBeVisible();

		// Mail Options section
		expect(page.getByText('Mail Options')).toBeVisible();
		expect(page.getByText('View mail as HTML (when possible)')).toBeVisible();
		expect(page.getByText('Display by')).toBeVisible();
		expect(page.getByText('Message', { exact: true })).toBeVisible();
		expect(page.getByText('Default Charset')).toBeVisible();
		expect(page.getByText('Big5')).toBeVisible();
		expect(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
		expect(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
		expect(page.getByText('Maximum size (bytes) allowed for each attachment')).toBeVisible();
		expect(page.getByText('~2 GB')).toBeVisible();

		// Receiving Mails section
		expect(page.getByText('Receiving Mails')).toBeVisible();
		expect(page.getByText('Minimum mail polling interval')).toBeVisible();
		expect(page.getByText('Days / Hours / Minutes / Sec')).toBeVisible();
		expect(page.getByText('Polling interval', { exact: true })).toBeVisible();

		// Forwarding section
		expect(page.getByText('Forwarding', { exact: true })).toBeVisible();
		expect(page.getByText('User can specify forwarding address')).toBeVisible();
		expect(page.getByText('User can specify mail forwarding filter')).toBeVisible();

		// Sending Mails section
		expect(page.getByText('Sending Mails')).toBeVisible();
		expect(page.getByText('Save to sent')).toBeVisible();
		expect(page.getByText('Read Receipt settings')).toBeVisible();

		// Contact Options section
		expect(page.getByText('Contact Options')).toBeVisible();
		expect(page.getByText('Enable auto-add contacts')).toBeVisible();
		expect(page.getByText('Use GAL to auto-fill')).toBeVisible();

		// Calendar Options section
		expect(page.getByText('Calendar Options')).toBeVisible();
		expect(page.getByText('Time Zone')).toBeVisible();
		expect(page.getByText('Appointment’s Default Duration')).toBeVisible();
		expect(page.getByText('Appointment Reminder (minutes before)')).toBeVisible();
		expect(page.getByText('Default Calendar View')).toBeVisible();
		expect(page.getByText('The Week starts on')).toBeVisible();
		expect(page.getByText('Default appointment visibility')).toBeVisible();
		expect(page.getByText('Enable reminders of appointments in the past')).toBeVisible();
		expect(page.getByText('Allow sending cancellation mail')).toBeVisible();
		expect(
			page.getByText('Automatically add forwarded appointments to the calendar')
		).toBeVisible();
		expect(page.getByText('Add invites with PUBLISH method')).toBeVisible();
		expect(page.getByText('Automatically add appointments when the user is invited')).toBeVisible();
		expect(page.getByText('Auto-decline if the sender is blacklisted')).toBeVisible();
		expect(page.getByText('Notify changes made by delegated accounts')).toBeVisible();
		expect(page.getByText('Use iCal delegation model for shared calendars')).toBeVisible();
	});
});
