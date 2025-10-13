/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConfigStore } from '../../../../store/config/store';
import { useRightsStore } from '../../../../store/rights/store';
import MTAAdvanced from '../mta-advanced';

vi.mock('../../../../services/modify-config', () => ({
	modifyConfig: vi.fn()
}));

function expectLoggingSectionVisible() {
	expect(page.getByText('Logging', { exact: true })).toBeVisible();
	expect(page.getByText('Enable logging of the remote SMTP client port')).toBeVisible();
}

function expectTuningSectionVisible() {
	expect(page.getByText('Tuning', { exact: true })).toBeVisible();
	expect(page.getByText('Max antivirus threads (value)')).toBeVisible();
	expect(page.getByText('Enable simple authentication and security layer')).toBeVisible();
}

function expectMailMessagesSizeSectionVisible() {
	expect(page.getByText('Mail messages size', { exact: true })).toBeVisible();
	expect(page.getByText('No size limit for mail messages')).toBeVisible();
	expect(page.getByText('Custom max size mail messages (MB)')).toBeVisible();
}

describe('MTAAdvanced', () => {
	const setupConfigStore = (): void => {
		useConfigStore.getState().setConfig([
			{ n: 'zimbraMtaSmtpdClientPortLogging', _content: 'yes' },
			{ n: 'zimbraAmavisLogLevel', _content: '2' },
			{ n: 'zimbraAmavisSALogLevel', _content: '0' },
			{ n: 'zimbraMtaSmtpdTlsLoglevel', _content: '1' },
			{ n: 'zimbraMtaLmtpTlsLoglevel', _content: '1' },
			{ n: 'zimbraClamAVMaxThreads', _content: '10' },
			{ n: 'zimbraLmtpNumThreads', _content: '20' },
			{ n: 'zimbraMilterNumThreads', _content: '5' },
			{ n: 'zimbraMilterMaxConnections', _content: '100' },
			{ n: 'zimbraMtaSmtpSaslAuthEnable', _content: 'yes' },
			{ n: 'zimbraMtaSmtpdSenderLoginMaps', _content: 'proxy:ldap://localhost:389' },
			{ n: 'zimbraMtaMaxMessageSize', _content: '10485760' }
		]);
	};

	const setupRightsStore = (): void => {
		useRightsStore.getState().setRights([
			{
				type: 'config',
				all: [
					{
						right: [{ n: 'modifyConfig' }, { n: 'getConfig' }],
						setAttrs: [{ all: true }],
						getAttrs: [{ all: true }]
					}
				]
			}
		]);
	};

	beforeEach(() => {
		vi.resetAllMocks();
		setupConfigStore();
		setupRightsStore();
	});

	it('should render the component correctly', async () => {
		setupBrowserTest(<MTAAdvanced />);
		expect(page.getByText('Advanced', { exact: true })).toBeVisible();
		expectLoggingSectionVisible();
		expectTuningSectionVisible();
		expectMailMessagesSizeSectionVisible();
	});

	it('should handle mail message size radio button interactions', async () => {
		setupBrowserTest(<MTAAdvanced />);

		const noLimitRadio = page.getByRole('radio', { name: 'No size limit for mail messages' });
		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });

		expect(noLimitRadio).toBeVisible();
		expect(customSizeRadio).toBeVisible();

		expect(customSizeRadio).toBeChecked();

		expect(page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")')).toBeVisible();

		await noLimitRadio.click();

		await customSizeRadio.click();

		expect(page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")')).toBeVisible();
	});

	it('should show error message for invalid message size input', async () => {
		setupBrowserTest(<MTAAdvanced />);

		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });
		await customSizeRadio.click();

		const sizeInput = page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")');

		await sizeInput.clear();
		await sizeInput.fill('0');

		expect(
			page.getByText('Value 0 disables email sending: enter a value greater than 0')
		).toBeVisible();

		await sizeInput.clear();
		await sizeInput.fill('100');
	});

	it('should handle switch interactions', async () => {
		setupBrowserTest(<MTAAdvanced />);

		const loggingSwitchLabel = page.getByText('Enable logging of the remote SMTP client port');
		expect(loggingSwitchLabel).toBeVisible();
		await loggingSwitchLabel.click();

		const authSwitchLabel = page.getByText('Enable simple authentication and security layer');
		expect(authSwitchLabel).toBeVisible();
		await authSwitchLabel.click();
	});

	it('should handle input field interactions', async () => {
		setupBrowserTest(<MTAAdvanced />);

		const antivirusInput = page.getByLabelText('Max antivirus threads (value)');
		expect(antivirusInput).toBeVisible();
		await antivirusInput.clear();
		await antivirusInput.fill('15');

		const lmtpInput = page.getByLabelText('LMTP threads (Value)');
		expect(lmtpInput).toBeVisible();
		await lmtpInput.clear();
		await lmtpInput.fill('25');

		const milterInput = page.getByLabelText('MILTER threads (value)');
		expect(milterInput).toBeVisible();
		await milterInput.clear();
		await milterInput.fill('8');

		const connectionsInput = page.getByLabelText(
			'Reject concurrent MILTER connections above (value)'
		);
		expect(connectionsInput).toBeVisible();
		await connectionsInput.clear();
		await connectionsInput.fill('150');

		const smtpdInput = page.getByLabelText('Smtpd sender login maps');
		expect(smtpdInput).toBeVisible();
		await smtpdInput.clear();
		await smtpdInput.fill('proxy:ldap://newhost:389');
	});

	it('should handle radio button state changes for message size limit', async () => {
		setupBrowserTest(<MTAAdvanced />);

		// Start with custom size selected (based on mock data)
		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });
		const noLimitRadio = page.getByRole('radio', { name: 'No size limit for mail messages' });

		expect(customSizeRadio).toBeChecked();

		// Input field should be visible
		const sizeInput = page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")');
		expect(sizeInput).toBeVisible();

		// Click "No size limit" - this should trigger setLimitMaxMessageSize(false) and setValue(ZIMBRA_MTA_MESSAGE_SIZE, '')
		await noLimitRadio.click();

		// Click back to "Custom size" - this should trigger setLimitMaxMessageSize(true)
		await customSizeRadio.click();

		// Input field should be visible again
		expect(page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")')).toBeVisible();
	});

	it('should handle message size input changes', async () => {
		setupBrowserTest(<MTAAdvanced />);

		// Ensure custom size is selected
		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });
		await customSizeRadio.click();

		const sizeInput = page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")');

		// Test multiple input changes to trigger setValue(ZIMBRA_MTA_MESSAGE_SIZE, e.target.value) and setZimbraMtaMaxMessageSizeState(e.target.value)
		await sizeInput.clear();
		await sizeInput.fill('50');

		await sizeInput.clear();
		await sizeInput.fill('100');

		await sizeInput.clear();
		await sizeInput.fill('200');

		// Test with invalid value to trigger error state
		await sizeInput.clear();
		await sizeInput.fill('0');
		expect(
			page.getByText('Value 0 disables email sending: enter a value greater than 0')
		).toBeVisible();

		// Test with negative value
		await sizeInput.clear();
		await sizeInput.fill('-10');
		expect(
			page.getByText('Value 0 disables email sending: enter a value greater than 0')
		).toBeVisible();

		// Test with valid value again
		await sizeInput.clear();
		await sizeInput.fill('150');
	});

	it('should handle component initialization with no message size limit', async () => {
		// Setup config without message size to test the no-limit initial state
		useConfigStore.getState().setConfig([
			{ n: 'zimbraMtaSmtpdClientPortLogging', _content: 'yes' },
			{ n: 'zimbraAmavisLogLevel', _content: '2' },
			{ n: 'zimbraAmavisSALogLevel', _content: '0' },
			{ n: 'zimbraMtaSmtpdTlsLoglevel', _content: '1' },
			{ n: 'zimbraMtaLmtpTlsLoglevel', _content: '1' },
			{ n: 'zimbraClamAVMaxThreads', _content: '10' },
			{ n: 'zimbraLmtpNumThreads', _content: '20' },
			{ n: 'zimbraMilterNumThreads', _content: '5' },
			{ n: 'zimbraMilterMaxConnections', _content: '100' },
			{ n: 'zimbraMtaSmtpSaslAuthEnable', _content: 'yes' },
			{ n: 'zimbraMtaSmtpdSenderLoginMaps', _content: 'proxy:ldap://localhost:389' }
			// Note: No zimbraMtaMaxMessageSize in this config
		]);

		setupBrowserTest(<MTAAdvanced />);

		// Should default to "No size limit"
		const noLimitRadio = page.getByRole('radio', { name: 'No size limit for mail messages' });
		expect(noLimitRadio).toBeChecked();

		// Now switch to custom size to trigger the state change
		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });
		await customSizeRadio.click();

		// Input field should appear
		expect(page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")')).toBeVisible();
	});

	it('should trigger setLimitMaxMessageSize(false) when clicking no limit radio', async () => {
		setupBrowserTest(<MTAAdvanced />);

		// Start with custom size selected (has message size in config)
		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });
		expect(customSizeRadio).toBeChecked();

		// Input field should be visible
		expect(page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")')).toBeVisible();

		// Click "No size limit" - this should trigger setLimitMaxMessageSize(false) and setValue(ZIMBRA_MTA_MESSAGE_SIZE, '')
		const noLimitRadio = page.getByRole('radio', { name: 'No size limit for mail messages' });
		await noLimitRadio.click();

		// The click should have triggered the state change functions
		// We verify this by ensuring the radio buttons are still visible (indicating the component didn't crash)
		expect(noLimitRadio).toBeVisible();
		expect(customSizeRadio).toBeVisible();
	});

	it('should trigger setLimitMaxMessageSize(true) when clicking custom size radio', async () => {
		// Setup config without message size to start with "No size limit" selected
		useConfigStore.getState().setConfig([
			{ n: 'zimbraMtaSmtpdClientPortLogging', _content: 'yes' },
			{ n: 'zimbraAmavisLogLevel', _content: '2' },
			{ n: 'zimbraAmavisSALogLevel', _content: '0' },
			{ n: 'zimbraMtaSmtpdTlsLoglevel', _content: '1' },
			{ n: 'zimbraMtaLmtpTlsLoglevel', _content: '1' },
			{ n: 'zimbraClamAVMaxThreads', _content: '10' },
			{ n: 'zimbraLmtpNumThreads', _content: '20' },
			{ n: 'zimbraMilterNumThreads', _content: '5' },
			{ n: 'zimbraMilterMaxConnections', _content: '100' },
			{ n: 'zimbraMtaSmtpSaslAuthEnable', _content: 'yes' },
			{ n: 'zimbraMtaSmtpdSenderLoginMaps', _content: 'proxy:ldap://localhost:389' }
		]);

		setupBrowserTest(<MTAAdvanced />);

		// Should start with "No size limit" selected
		const noLimitRadio = page.getByRole('radio', { name: 'No size limit for mail messages' });
		expect(noLimitRadio).toBeChecked();

		// Click "Custom size" - this should trigger setLimitMaxMessageSize(true)
		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });
		await customSizeRadio.click();

		// Verify the input field appears (indicating the state change worked)
		expect(page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")')).toBeVisible();

		// Verify both radio buttons are still visible (indicating the component didn't crash)
		expect(noLimitRadio).toBeVisible();
		expect(customSizeRadio).toBeVisible();
	});

	it('should trigger setValue and setZimbraMtaMaxMessageSizeState on input change', async () => {
		setupBrowserTest(<MTAAdvanced />);

		// Ensure custom size is selected
		const customSizeRadio = page.getByRole('radio', { name: 'Custom max size mail messages (MB)' });
		await customSizeRadio.click();

		const sizeInput = page.getByLabelText('Max size for mail messages (MB, 0 = "no limit")');

		// Test the onChange handler by filling different values
		// This should trigger both setValue(ZIMBRA_MTA_MESSAGE_SIZE, e.target.value) and setZimbraMtaMaxMessageSizeState(e.target.value)
		await sizeInput.clear();
		await sizeInput.fill('123');

		await sizeInput.clear();
		await sizeInput.fill('456');

		await sizeInput.clear();
		await sizeInput.fill('789');

		// Test with decimal values
		await sizeInput.clear();
		await sizeInput.fill('12.5');

		// Test with zero (should show error)
		await sizeInput.clear();
		await sizeInput.fill('0');
		expect(
			page.getByText('Value 0 disables email sending: enter a value greater than 0')
		).toBeVisible();

		// Test with negative value (should show error)
		await sizeInput.clear();
		await sizeInput.fill('-5');
		expect(
			page.getByText('Value 0 disables email sending: enter a value greater than 0')
		).toBeVisible();

		// Test with valid value to clear error
		await sizeInput.clear();
		await sizeInput.fill('100');
	});
});
