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
	});
});
