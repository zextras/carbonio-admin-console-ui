/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { act } from 'react';

import { screen } from '@testing-library/react';
import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getSoapFetchRequest } from '@zextras/carbonio-shell-ui';

import { setup } from '../../../../../tests/testUtils';
import RestoreDeleteAccountWizard from '../restore-delete-account-wizard';

jest.mock('@zextras/carbonio-shell-ui', () => ({
	getSoapFetchRequest: jest.fn(),
	fetchExternalSoap: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

const id = '292342cf-1d9a-4f3a-b394-1093998430eb';
const serverName = 'kc-dev3-mbox.demo.zextras.io';
const serverName2 = 'kc-dev3-u22-mbox3.demo.zextras.io';
const mockResponse = {
	serverName2: {
		response: {
			accounts: [
				{
					name: 'test11@demo.zextras.io',
					creationTimestamp: 1742205198729,
					serverName: serverName2,
					legalHold: 'true',
					id,
					status: 'Active'
				}
			],
			maxPage: 1
		},
		ok: true
	},
	'kc-dev3-u22-mbox4.demo.zextras.io': {
		response: {
			accounts: [],
			maxPage: 0
		},
		ok: true
	},
	serverName: {
		response: {
			accounts: [
				{
					name: 'test12@demo.zextras.io',
					creationTimestamp: 1742205198729,
					serverName,
					legalHold: 'true',
					id,
					status: 'Active'
				}
			],
			maxPage: 1
		},
		ok: true
	}
};

describe('RestoreDeleteAccountWizard Component', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
		(getSoapFetchRequest as jest.Mock).mockResolvedValue(mockResponse);
	});

	test('renders', async () => {
		await act(async () => {
			setup(
				<RestoreDeleteAccountWizard
					setShowRestoreAccountWizard={undefined}
					restoreAccountRequest={undefined}
					isRequestWorkInProgress={undefined}
				/>
			);
		});
		expect(screen.getByText(/test12/i)).toBeInTheDocument();
	});

	test('restoreAccountRequest callback works as expected', async () => {
		const mockRestoreAccountRequest = jest.fn();
		const mockSetShowRestoreAccountWizard = jest.fn();

		await act(async () => {
			setup(
				<RestoreDeleteAccountWizard
					setShowRestoreAccountWizard={mockSetShowRestoreAccountWizard}
					restoreAccountRequest={mockRestoreAccountRequest}
					isRequestWorkInProgress={undefined}
				/>
			);
		});

		const mockData = {
			name: 'testAccount',
			id: '12345',
			createDate: '2023-01-01',
			status: 'Active',
			copyAccount: 'copyAccount',
			dateTime: '2023-01-02',
			lastAvailableStatus: true,
			hsmApply: true,
			dataSource: true,
			notificationReceiver: 'test@example.com',
			isEmailNotificationEnable: true,
			copyDomain: 'example.com',
			serverName: 'server.example.com'
		};

		await act(async () => {
			mockRestoreAccountRequest(
				mockData.name,
				mockData.id,
				mockData.createDate,
				mockData.status,
				mockData.copyAccount,
				mockData.dateTime,
				mockData.lastAvailableStatus,
				mockData.hsmApply,
				mockData.dataSource,
				mockData.notificationReceiver,
				mockData.isEmailNotificationEnable,
				mockData.copyDomain,
				mockData.serverName
			);
		});

		expect(mockRestoreAccountRequest).toHaveBeenCalledWith(
			mockData.name,
			mockData.id,
			mockData.createDate,
			mockData.status,
			mockData.copyAccount,
			mockData.dateTime,
			mockData.lastAvailableStatus,
			mockData.hsmApply,
			mockData.dataSource,
			mockData.notificationReceiver,
			mockData.isEmailNotificationEnable,
			mockData.copyDomain,
			mockData.serverName
		);
		expect(mockRestoreAccountRequest).toHaveBeenCalledTimes(1);
	});
});
