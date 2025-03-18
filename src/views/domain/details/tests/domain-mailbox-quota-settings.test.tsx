/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, screen } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import { useUserSettings } from '@zextras/carbonio-shell-ui';

import { TRUE } from '../../../../constants';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../store/domain/store';
import { setup } from '../../../../tests/testUtils';
import DomainMailboxQuotaSetting from '../domain-mailbox-quota-settings';

const maxMailboxQuotaLabel = 'Max mailbox quota for the Mails (GB)';
const maxMailboxQuotaThresholdLabel = 'Mail Space Quota threshold (%) warning';

// jest.mock('react-i18next', () => ({
// 	useTranslation: jest.fn()
// }));

jest.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: jest.fn()
}));

jest.mock('../../../../store/domain/store', () => ({
	useDomainStore: jest.fn()
}));

jest.mock('../../../../store/auth-advanced/store', () => ({
	useAuthIsAdvanced: jest.fn()
}));

describe('Mailbox Quota Settings', () => {
	const cancelBtnId = 'cancel-button';
	const saveBtnId = 'save-button';
	beforeEach(() => {
		// (useTranslation as jest.Mock).mockReturnValue([jest.fn()]);
		(useUserSettings as jest.Mock).mockReturnValue({
			attrs: {
				zimbraIsAdminAccount: TRUE
			}
		});
		(useDomainStore as unknown as jest.Mock).mockReturnValue({
			domain: { a: [] },
			setDomain: jest.fn()
		});
		(useAuthIsAdvanced as unknown as jest.Mock).mockReturnValue({
			isAdvanced: true
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
			await user.type(input, ' ');
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
});
