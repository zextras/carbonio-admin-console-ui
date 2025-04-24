/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, screen, within } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';

import { TRUE } from '../../../../constants';
import { getQuotaUsageAdvance } from '../../../../services/get-file-quota-accounts-usage';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../store/domain/store';
import { setup } from '../../../../tests/testUtils';
import DomainMailboxQuotaSetting, { getQuotaData } from '../domain-mailbox-quota-settings';

const maxMailboxQuotaLabel = 'Max mailbox quota for the Mails (GB)';
const maxMailboxQuotaThresholdLabel = 'Mail Space Quota threshold (%) warning';

jest.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: jest.fn()
}));

jest.mock('../../../../store/auth-advanced/store', () => ({
	useAuthIsAdvanced: jest.fn()
}));

const createSnackbar = (arg: any): CreateSnackbarFn => arg;
const createSnackbarSpy = jest.fn(createSnackbar);

// eslint-disable-next-line sonarjs/no-duplicate-string
jest.mock('@zextras/carbonio-design-system', () => ({
	...jest.requireActual('@zextras/carbonio-design-system'),
	useSnackbar: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

jest.mock('../../../../services/get-file-quota-accounts-usage', () => ({
	getQuotaUsageAdvance: jest.fn()
}));

const domain = {
	name: 'demo.zextras.io',
	id: '142f56c1-aaf1-432b-9cfa-448e1b952cf6',
	a: [
		{
			n: 'zimbraGalAccountId',
			_content: '5b099ec4-1a40-4b98-ba2b-63525d5fc'
		},
		{
			n: 'carbonioNotificationFrom',
			_content: 'zextras@demo.zextras.io'
		},
		{
			n: 'zimbraDomainName',
			_content: 'demo.zextras.io'
		},
		{
			n: 'carbonioSearchSpecifiedDomainsByFeature',
			_content: 'abc.com'
		},
		{
			n: 'objectClass',
			_content: 'dcObject'
		},
		{
			n: 'objectClass',
			_content: 'organization'
		},
		{
			n: 'objectClass',
			_content: 'zimbraDomain'
		},
		{
			n: 'objectClass',
			_content: 'amavisAccount'
		},
		{
			n: 'carbonioNotificationRecipients',
			_content: 'zextras@demo.zextras.io'
		},
		{
			n: 'zimbraMailStatus',
			_content: 'enabled'
		},
		{
			n: 'o',
			_content: 'demo.zextras.io domain'
		},
		{
			n: 'zimbraNotes',
			_content: 'aab'
		},
		{
			n: 'zimbraPublicServiceHostname',
			_content: 'kc-dev5-u22-ce.demo.zextras.io'
		},
		{
			n: 'zimbraDomainStatus',
			_content: 'active'
		},
		{
			n: 'zimbraDomainDefaultCOSId',
			_content: '230fafd4-987b-4d2c-a4ba-fb9bc6b71f97'
		},
		{
			n: 'zimbraId',
			_content: '142f56c1-aaf1-432b-9cfa-448e1b952cf6'
		},
		{
			n: 'zimbraDomainType',
			_content: 'local'
		},
		{
			n: 'zimbraCreateTimestamp',
			_content: '20240718072455.621Z'
		},
		{
			n: 'zimbraAggregateQuotaLastUsage',
			_content: '905962776'
		},
		{
			n: 'dc',
			_content: 'demo'
		}
	]
};

describe('Mailbox Quota Settings', () => {
	const setupDomainStore = (): void => {
		useDomainStore.getState().setDomain(domain);
	};

	const cancelBtnId = 'cancel-button';
	const saveBtnId = 'save-button';
	beforeEach(() => {
		jest.resetAllMocks();
		setupDomainStore();
		jest.clearAllMocks();

		(useUserSettings as jest.Mock).mockReturnValue({
			attrs: {
				zimbraIsAdminAccount: TRUE
			}
		});

		(useAuthIsAdvanced as unknown as jest.Mock).mockReturnValue({
			isAdvanced: true
		});
		(useSnackbar as jest.Mock).mockReturnValue(createSnackbarSpy);

		const mockGetQuotaUsageAdvance = getQuotaUsageAdvance as jest.MockedFunction<any>;
		mockGetQuotaUsageAdvance.mockResolvedValue({
			accounts: [
				{
					accountName: 'user12@example.com',
					accountId: '1',
					mailsQuotaUsed: 5000000000,
					mailsQuotaLimit: 10000000000,
					filesQuotaUsed: 2000000000,
					filesQuotaLimit: 4000000000
				}
			],
			total: 1
		});
	});

	test('renders Mailbox Quota section with valid data', () => {
		setup(<DomainMailboxQuotaSetting />);

		expect(screen.getByText('Mailbox Quota')).toBeInTheDocument();
		expect(screen.getByText(maxMailboxQuotaLabel)).toBeInTheDocument();
	});

	test('displays correct input fields', () => {
		setup(<DomainMailboxQuotaSetting />);

		expect(screen.getByLabelText(maxMailboxQuotaLabel)).toBeInTheDocument();
		expect(screen.getByLabelText(maxMailboxQuotaThresholdLabel)).toBeInTheDocument();
		expect(screen.getByLabelText('Receiver of Quota warning (email)')).toBeInTheDocument();
	});

	test('handles input changes correctly', async () => {
		const { user } = setup(<DomainMailboxQuotaSetting />);
		const input = screen.getByLabelText(maxMailboxQuotaLabel);

		await act(async () => {
			await user.type(input, '10');
		});

		expect(input).toHaveValue('10');
	});

	test('handles mailbox quota threshold changes correctly', async () => {
		const { user } = setup(<DomainMailboxQuotaSetting />);
		const input = screen.getByLabelText(maxMailboxQuotaThresholdLabel);

		await act(async () => {
			await user.type(input, '10');
		});

		expect(input).toHaveValue(10);
	});

	test('handles mailbox quota threshold empty value changes correctly', async () => {
		const { user } = setup(<DomainMailboxQuotaSetting />);
		const input = screen.getByLabelText(maxMailboxQuotaThresholdLabel);
		await act(async () => {
			await user.type(input, '5');
		});
		await act(async () => {
			await user.type(input, '{backspace}');
		});

		expect(input).toHaveValue(null);
	});

	test('displays save and cancel buttons after modifying fields', async () => {
		const { user } = setup(<DomainMailboxQuotaSetting />);
		const input = screen.getByLabelText(maxMailboxQuotaLabel);

		await act(async () => {
			await user.type(input, '10');
		});

		expect(screen.getByTestId(saveBtnId)).toBeInTheDocument();
		expect(screen.getByTestId(cancelBtnId)).toBeInTheDocument();
	});

	test('clicking cancel button hides save and cancel buttons', async () => {
		const { user } = setup(<DomainMailboxQuotaSetting />);
		const input = screen.getByLabelText(maxMailboxQuotaLabel);

		await act(async () => {
			await user.type(input, '10');
		});

		await act(async () => {
			await user.click(screen.getByTestId(cancelBtnId));
		});

		expect(screen.queryByTestId(saveBtnId)).not.toBeInTheDocument();
		expect(screen.queryByTestId(cancelBtnId)).not.toBeInTheDocument();
	});

	test('clicking paging page change', async () => {
		const { user } = setup(<DomainMailboxQuotaSetting />);

		await act(async () => {
			await user.click(screen.getByTestId('next-page'));
		});

		const view = screen.getByTestId('pagination-select');
		await user.click(within(view).getByText(/10/i));

		expect(screen.queryByTestId(saveBtnId)).not.toBeInTheDocument();
		expect(screen.queryByTestId(cancelBtnId)).not.toBeInTheDocument();
	});

	test('processes quota data correctly for basic usage', () => {
		const quotaInput = [
			{
				name: 'user1@example.com',
				id: '1',
				mailsQuotaUsed: 5000000000,
				mailsQuotaLimit: 10000000000
			},
			{
				name: 'user2@example.com',
				id: '2',
				mailsQuotaUsed: 0,
				mailsQuotaLimit: 0
			}
		];

		const result = getQuotaData(quotaInput, jest.fn());

		expect(result).toEqual([
			{
				name: 'user1@example.com',
				id: '1',
				mailsQuota: 9.313225746154785,
				mailsQuotaUsed: '4.66',
				mailsQuotaUsedPercentage: '50'
			},
			{
				name: 'user2@example.com',
				id: '2',
				mailsQuota: undefined,
				mailsQuotaUsed: '0.00',
				mailsQuotaUsedPercentage: '0'
			}
		]);
	});

	test('processes quota data correctly for advanced usage', () => {
		const quotaInput = [
			{
				accountName: 'user3@example.com',
				accountId: '3',
				mailsQuotaUsed: 2000000000,
				mailsQuotaLimit: 4000000000,
				filesQuotaUsed: 1000000000,
				filesQuotaLimit: 2000000000
			}
		];

		const result = getQuotaData(quotaInput, jest.fn(), true);
		expect(result).toEqual([
			{
				name: 'user3@example.com',
				id: '3',
				mailsQuota: 3.725290298461914,
				mailsQuotaUsed: '1.86',
				mailsQuotaUsedPercentage: '50',
				filesQuota: 1.862645149230957,
				filesQuotaUsed: '0.93',
				filesQuotaUsedPercentage: '50'
			}
		]);
	});
});
