/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useConfigStore } from '../../../store/config/store';
import { useRightsStore } from '../../../store/rights/store';

import MTAAdvanced from './mta-advanced';

// Mock the services

vi.mock('../../../../services/modify-config', () => ({
	modifyConfig: vi.fn()
}));

describe('MTAAdvanced Unit Tests', () => {
	const setupStores = () => {
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

	it('should render without crashing', () => {
		setupStores();
		const { container } = setupTest(<MTAAdvanced />);
		expect(container).toBeDefined();
	});

	it('should handle radio button change to no limit', async () => {
		setupStores();
		const { getByRole, user } = setupTest(<MTAAdvanced />);

		const noLimitRadio = getByRole('radio', {
			name: 'No size limit for mail messages'
		}) as HTMLInputElement;
		await user.click(noLimitRadio);

		expect(noLimitRadio.checked).toBe(true);
	});

	it('should handle radio button change to custom size', async () => {
		setupStores();
		const { getByRole, user } = setupTest(<MTAAdvanced />);

		// First click no limit, then custom size to trigger both paths
		const noLimitRadio = getByRole('radio', {
			name: 'No size limit for mail messages'
		}) as HTMLInputElement;
		const customSizeRadio = getByRole('radio', {
			name: 'Custom max size mail messages (MB)'
		}) as HTMLInputElement;

		await user.click(noLimitRadio);
		await user.click(customSizeRadio);

		expect(customSizeRadio.checked).toBe(true);
	});

	it('should handle input field changes', async () => {
		setupStores();
		const { getByLabelText, user } = setupTest(<MTAAdvanced />);

		const input = getByLabelText(
			'Max size for mail messages (MB, 0 = "no limit")'
		) as HTMLInputElement;
		await user.clear(input);
		await user.type(input, '50');

		expect(input.value).toBe('50');
	});

	it('should handle text input changes', async () => {
		setupStores();
		const { getByLabelText, user } = setupTest(<MTAAdvanced />);

		// Test various numeric inputs
		const clamavInput = getByLabelText('Max antivirus threads (value)') as HTMLInputElement;
		await user.clear(clamavInput);
		await user.type(clamavInput, '15');

		expect(clamavInput.value).toBe('15');
	});

	it('should handle sender login maps input', async () => {
		setupStores();
		const { getByLabelText, user } = setupTest(<MTAAdvanced />);

		const senderMapsInput = getByLabelText('Smtpd sender login maps') as HTMLInputElement;
		await user.clear(senderMapsInput);
		await user.type(senderMapsInput, 'proxy:ldap://test:389');

		expect(senderMapsInput.value).toBe('proxy:ldap://test:389');
	});

	it('should handle LMTP threads input', async () => {
		setupStores();
		const { getByLabelText, user } = setupTest(<MTAAdvanced />);

		const lmtpInput = getByLabelText('LMTP threads (Value)') as HTMLInputElement;
		await user.clear(lmtpInput);
		await user.type(lmtpInput, '25');

		expect(lmtpInput.value).toBe('25');
	});

	it('should handle MILTER threads input', async () => {
		setupStores();
		const { getByLabelText, user } = setupTest(<MTAAdvanced />);

		const milterInput = getByLabelText('MILTER threads (value)') as HTMLInputElement;
		await user.clear(milterInput);
		await user.type(milterInput, '8');

		expect(milterInput.value).toBe('8');
	});

	it('should handle MILTER connections input', async () => {
		setupStores();
		const { getByLabelText, user } = setupTest(<MTAAdvanced />);

		const connectionsInput = getByLabelText(
			'Reject concurrent MILTER connections above (value)'
		) as HTMLInputElement;
		await user.clear(connectionsInput);
		await user.type(connectionsInput, '150');

		expect(connectionsInput.value).toBe('150');
	});
});
