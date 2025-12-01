/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAccountStore } from '@zextras/admin-ui-bootstrap/testing';
import { grantUserRights, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { page } from 'vitest/browser';

import { useCosStore } from '../../../../store/cos/store';
import { COSPreferences } from '../COSPreferences';

function expectGeneralOptionsSectionVisible() {
	expect(page.getByText('General Options')).toBeVisible();
	expect(page.getByText('English - English')).toBeVisible();
	expect(page.getByText('Language')).toBeVisible();
}

function expectMailOptionsSectionVisible() {
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
}

function expectReceivingMailsSectionVisible() {
	expect(page.getByText('Receiving Mails')).toBeVisible();
	expect(page.getByText('Minimum mail polling interval')).toBeVisible();
	expect(page.getByText('Days / Hours / Minutes / Sec')).toBeVisible();
	expect(page.getByText('Polling interval', { exact: true })).toBeVisible();
}

function expectForwardingSectionVisible() {
	expect(page.getByText('Forwarding', { exact: true })).toBeVisible();
	expect(page.getByText('User can specify forwarding address')).toBeVisible();
	expect(page.getByText('User can specify mail forwarding filter')).toBeVisible();
}

function expectSendingMailsSectionVisible() {
	expect(page.getByText('Sending Mails')).toBeVisible();
	expect(page.getByText('Save to sent')).toBeVisible();
	expect(page.getByText('Allow the user to ask for a read receipt')).toBeVisible();
}

function expectContactOptionsSectionVisible() {
	expect(page.getByText('Contact Options')).toBeVisible();
	expect(page.getByText('Enable auto-add contacts')).toBeVisible();
	expect(page.getByText('Use GAL to auto-fill')).toBeVisible();
}

function expectCalendarOptionsVisible() {
	expect(page.getByText('Calendar Options')).toBeVisible();
	expect(page.getByText('Time Zone')).toBeVisible();
	expect(page.getByText('Appointment’s Default Duration')).toBeVisible();
	expect(page.getByText('Appointment Reminder (minutes before)')).toBeVisible();
	expect(page.getByText('Default Calendar View')).toBeVisible();
	expect(page.getByText('The Week starts on')).toBeVisible();
	expect(page.getByText('Default appointment visibility')).toBeVisible();
	expect(page.getByText('Enable reminders of appointments in the past')).toBeVisible();
	expect(page.getByText('Allow sending cancellation mail')).toBeVisible();
	expect(page.getByText('Automatically add forwarded appointments to the calendar')).toBeVisible();
	expect(page.getByText('Add invites with PUBLISH method')).toBeVisible();
	expect(page.getByText('Automatically add appointments when the user is invited')).toBeVisible();
	expect(page.getByText('Auto-decline if the sender is blacklisted')).toBeVisible();
	expect(page.getByText('Notify changes made by delegated accounts')).toBeVisible();
	expect(page.getByText('Use iCal delegation model for shared calendars')).toBeVisible();
}

describe('COSPreferences', () => {
	const setupCosStore = (): void => {
		useCosStore.getState().setCos({
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			name: 'default',
			isDefaultCos: true,
			a: [
				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
				{ n: 'zimbraPrefLocale', _content: 'en' },
				{ n: 'zimbraFeatureReadReceiptsEnabled', _content: 'FALSE' },
				{ n: 'zimbraPrefMailSendReadReceipts', _content: 'never' }
			]
		});
	};

	beforeEach(async () => {
		vi.resetAllMocks();
		grantUserRights();
		setupCosStore();

		// Set up user account store for useCurrentUserRights hook
		useAccountStore.setState({
			account: {
				id: 'test-user-id',
				name: 'test@example.com',
				displayName: '',
				signatures: {
					signature: []
				},
				identities: undefined,
				rights: { targets: [] }
			},
			settings: {
				prefs: {},
				attrs: {},
				props: []
			},
			usedQuota: 0
		});
	});

	afterEach(() => {
		resetMockWorker();
		useCosStore.getState().reset();
	});

	it('should render the component correctly', async () => {
		setupBrowserTest(<COSPreferences />);
		expect(page.getByText('Preferences')).toBeVisible();
		expectGeneralOptionsSectionVisible();
		expectMailOptionsSectionVisible();
		expectReceivingMailsSectionVisible();
		expectForwardingSectionVisible();
		expectSendingMailsSectionVisible();
		expectContactOptionsSectionVisible();
		expectCalendarOptionsVisible();
	});

	it('should toggle zimbraFeatureReadReceiptsEnabled when clicking the read receipt switch', async () => {
		setupBrowserTest(<COSPreferences />);

		// Wait for the component to render
		await expect.element(page.getByText('Sending Mails')).toBeVisible();

		// Find the "Allow the user to ask for a read receipt" label
		const readReceiptLabel = page.getByText('Allow the user to ask for a read receipt');
		await expect.element(readReceiptLabel).toBeVisible();

		// Click on the label which will trigger the switch
		await readReceiptLabel.click();

		// Verify the Save button appears after the change (indicating unsaved changes)
		const saveButton = page.getByRole('button', { name: 'Save' });
		await expect.element(saveButton).toBeVisible();
	});

	it('should change zimbraPrefMailSendReadReceipts when selecting a different option', async () => {
		setupBrowserTest(<COSPreferences />);

		// Wait for the Receiving Mails section to render
		await expect.element(page.getByText('Receiving Mails')).toBeVisible();

		// In the "Receiving Mails" section, find the "Read Receipt settings" select dropdown
		const readReceiptSettingsLabel = page.getByText('Read Receipt settings');
		await expect.element(readReceiptSettingsLabel).toBeVisible();

		// Click on the select to open the dropdown
		await readReceiptSettingsLabel.click();

		// Select "Always send a read receipt" option
		const alwaysSendOption = page.getByText('Always send a read receipt');
		await alwaysSendOption.click();

		// Verify the Save button appears after the change
		const saveButton = page.getByRole('button', { name: 'Save' });
		await expect.element(saveButton).toBeVisible();
	});
});
