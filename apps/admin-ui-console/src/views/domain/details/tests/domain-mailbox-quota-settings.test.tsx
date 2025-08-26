/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUserSettings } from '@zextras/admin-ui-bootstrapper';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';

import { TRUE } from '../../../../constants';
import { getQuotaUsageAdvance } from '../../../../services/get-file-quota-accounts-usage';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../store/domain/store';
import { setup } from '../../../../tests/testUtils';
import DomainMailboxQuotaSetting, { getQuotaData } from '../domain-mailbox-quota-settings';

// Label Constants
const LABEL_MAX_MAILBOX_QUOTA = 'Max mailbox quota for the Mails (GB)';
const LABEL_MAILBOX_QUOTA_THRESHOLD = 'Mail Space Quota threshold (%) warning';
const LABEL_QUOTA_WARNING_RECEIVER = 'Receiver of Quota warning (email)';

// TestID Constants
const TEST_ID_SAVE_BUTTON = 'save-button';
const TEST_ID_CANCEL_BUTTON = 'cancel-button';
const TEST_ID_NEXT_PAGE = 'next-page';
const TEST_ID_PAGINATION_SELECT = 'pagination-select';
const TEST_ID_DROPDOWN_LIST = 'dropdown-popper-list';

// Domain Mock
const mockDomain = {
	name: 'demo.zextras.io',
	id: '142f56c1-aaf1-432b-9cfa-448e1b952cf6',
	a: [
		{ n: 'zimbraGalAccountId', _content: '5b099ec4-1a40-4b98-ba2b-63525d5fc' },
		{ n: 'carbonioNotificationFrom', _content: 'zextras@demo.zextras.io' },
		{ n: 'zimbraDomainName', _content: 'demo.zextras.io' },
		{ n: 'carbonioSearchSpecifiedDomainsByFeature', _content: 'abc.com' },
		{ n: 'objectClass', _content: 'zimbraDomain' },
		{ n: 'carbonioNotificationRecipients', _content: 'zextras@demo.zextras.io' },
		{ n: 'zimbraMailStatus', _content: 'enabled' },
		{ n: 'zimbraPublicServiceHostname', _content: 'kc-dev5-u22-ce.demo.zextras.io' },
		{ n: 'zimbraDomainStatus', _content: 'active' },
		{ n: 'zimbraDomainDefaultCOSId', _content: '230fafd4-987b-4d2c-a4ba-fb9bc6b71f97' },
		{ n: 'zimbraId', _content: '142f56c1-aaf1-432b-9cfa-448e1b952cf6' },
		{ n: 'zimbraDomainType', _content: 'local' },
		{ n: 'zimbraCreateTimestamp', _content: '20240718072455.621Z' },
		{ n: 'zimbraAggregateQuotaLastUsage', _content: '905962776' },
		{ n: 'dc', _content: 'demo' }
	]
};

jest.mock('../../../../store/auth-advanced/store', () => ({
	useAuthIsAdvanced: jest.fn()
}));

const mockCreateSnackbar = (arg: any): CreateSnackbarFn => arg;
const mockCreateSnackbarSpy = jest.fn(mockCreateSnackbar);

jest.mock('@zextras/carbonio-design-system', () => ({
	...jest.requireActual('@zextras/carbonio-design-system'),
	useSnackbar: jest.fn()
}));

jest.mock('../../../../services/get-file-quota-accounts-usage', () => ({
	getQuotaUsageAdvance: jest.fn()
}));

describe('Mailbox Quota Settings', () => {
	const initializeDomainStore = (): void => {
		useDomainStore.getState().setDomain(mockDomain);
	};

	beforeEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
		initializeDomainStore();

		(useUserSettings as jest.Mock).mockReturnValue({
			attrs: { zimbraIsAdminAccount: TRUE }
		});

		(useAuthIsAdvanced as unknown as jest.Mock).mockReturnValue({
			isAdvanced: true
		});

		(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbarSpy);

		(getQuotaUsageAdvance as jest.Mock).mockResolvedValue({
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
			total: 20
		});
	});

	test('renders Mailbox Quota section with valid data', async () => {
		await act(async () => {
			setup(<DomainMailboxQuotaSetting />);
		});
		expect(screen.getByText('Mailbox Quota')).toBeInTheDocument();
		expect(screen.getByText(LABEL_MAX_MAILBOX_QUOTA)).toBeInTheDocument();
	});

	test('displays correct input fields', async () => {
		await act(async () => {
			setup(<DomainMailboxQuotaSetting />);
		});
		expect(screen.getByLabelText(LABEL_MAX_MAILBOX_QUOTA)).toBeInTheDocument();
		expect(screen.getByLabelText(LABEL_MAILBOX_QUOTA_THRESHOLD)).toBeInTheDocument();
		expect(screen.getByLabelText(LABEL_QUOTA_WARNING_RECEIVER)).toBeInTheDocument();
	});

	test('handles input changes correctly', async () => {
		let user: ReturnType<typeof userEvent.setup> = userEvent.setup();
		await act(async () => {
			user = setup(<DomainMailboxQuotaSetting />).user;
		});
		const input = screen.getByLabelText(LABEL_MAX_MAILBOX_QUOTA);
		await act(async () => {
			await user.clear(input);
			await user.type(input, '10');
		});
		expect(input).toHaveValue('10');
	});

	test('handles mailbox quota threshold changes correctly', async () => {
		let user: ReturnType<typeof userEvent.setup> = userEvent.setup();
		await act(async () => {
			user = setup(<DomainMailboxQuotaSetting />).user;
		});
		const input = screen.getByLabelText(LABEL_MAILBOX_QUOTA_THRESHOLD);
		await act(async () => {
			await user.type(input, '10');
		});
		expect(input).toHaveValue(10);
	});

	test('handles empty mailbox quota threshold correctly', async () => {
		let user: ReturnType<typeof userEvent.setup> = userEvent.setup();
		await act(async () => {
			user = setup(<DomainMailboxQuotaSetting />).user;
		});
		const input = screen.getByLabelText(LABEL_MAILBOX_QUOTA_THRESHOLD);
		await act(async () => {
			await user.type(input, '5');
			await user.type(input, '{backspace}');
		});
		expect(input).toHaveValue(null);
	});

	test('shows save and cancel buttons after editing fields', async () => {
		let user: ReturnType<typeof userEvent.setup> = userEvent.setup();
		await act(async () => {
			user = setup(<DomainMailboxQuotaSetting />).user;
		});
		const input = screen.getByLabelText(LABEL_MAX_MAILBOX_QUOTA);
		await act(async () => {
			await user.type(input, '10');
		});
		expect(screen.getByTestId(TEST_ID_SAVE_BUTTON)).toBeInTheDocument();
		expect(screen.getByTestId(TEST_ID_CANCEL_BUTTON)).toBeInTheDocument();
	});

	test('click on save button', async () => {
		let user: ReturnType<typeof userEvent.setup> = userEvent.setup();
		await act(async () => {
			user = setup(<DomainMailboxQuotaSetting />).user;
		});
		const input = screen.getByLabelText(LABEL_MAX_MAILBOX_QUOTA);
		await act(async () => {
			await user.type(input, '10');
		});
		expect(screen.getByTestId(TEST_ID_SAVE_BUTTON)).toBeInTheDocument();

		await act(async () => {
			await user.click(screen.getByTestId(TEST_ID_SAVE_BUTTON));
		});
	});

	test('hides save and cancel buttons on cancel', async () => {
		let user: ReturnType<typeof userEvent.setup>;

		await act(async () => {
			const setupObject = setup(<DomainMailboxQuotaSetting />);
			user = setupObject.user;
		});

		const input = screen.getByLabelText(LABEL_MAX_MAILBOX_QUOTA);

		await act(async () => {
			await user.type(input, '10');
		});

		await act(async () => {
			await user.click(screen.getByTestId(TEST_ID_CANCEL_BUTTON));
		});

		expect(screen.queryByTestId(TEST_ID_SAVE_BUTTON)).not.toBeInTheDocument();
		expect(screen.queryByTestId(TEST_ID_CANCEL_BUTTON)).not.toBeInTheDocument();
	});

	test('handles pagination changes correctly', async () => {
		let user: ReturnType<typeof userEvent.setup> = userEvent.setup();
		await act(async () => {
			user = setup(<DomainMailboxQuotaSetting />).user;
		});
		await act(async () => {
			await user.click(screen.getByTestId(TEST_ID_NEXT_PAGE));
			await user.click(within(screen.getByTestId(TEST_ID_PAGINATION_SELECT)).getByText(/10/i));
		});
		await waitFor(() => {
			expect(screen.getByTestId(TEST_ID_DROPDOWN_LIST)).toBeInTheDocument();
		});
		await act(async () => {
			await user.click(within(screen.getByTestId(TEST_ID_DROPDOWN_LIST)).getByText(/15/i));
		});
	});

	test('formats basic quota data correctly', () => {
		const input = [
			{
				name: 'user1@example.com',
				id: '1',
				mailsQuotaUsed: 5000000000,
				mailsQuotaLimit: 10000000000
			},
			{ name: 'user2@example.com', id: '2', mailsQuotaUsed: 0, mailsQuotaLimit: 0 }
		];
		const result = getQuotaData(input, jest.fn());
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

	test('formats advanced quota data correctly', () => {
		const input = [
			{
				accountName: 'user3@example.com',
				accountId: '3',
				mailsQuotaUsed: 2000000000,
				mailsQuotaLimit: 4000000000,
				filesQuotaUsed: 1000000000,
				filesQuotaLimit: 2000000000
			}
		];
		const result = getQuotaData(input, jest.fn(), true);
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

	test('formats small quota values properly', () => {
		const input = [
			{
				accountName: 'user5@example.com',
				accountId: '5',
				mailsQuotaUsed: 1048000,
				mailsQuotaLimit: 1048500,
				filesQuotaUsed: 1048000,
				filesQuotaLimit: 1048400
			}
		];
		const result = getQuotaData(input, jest.fn(), true);
		expect(result).toEqual([
			{
				name: 'user5@example.com',
				id: '5',
				mailsQuota: '1',
				mailsQuotaUsed: '0.00',
				mailsQuotaUsedPercentage: '100',
				filesQuota: '1',
				filesQuotaUsed: '0.00',
				filesQuotaUsedPercentage: '100'
			}
		]);
	});
});
