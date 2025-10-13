/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
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
						right: [
							{ n: 'modifyConfig' },
							{ n: 'getConfig' }
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
});