/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { act } from 'react';

import { screen } from '@testing-library/react';

import { setup } from '../../../../../tests/testUtils';
import { RestoreDeleteAccountContext } from '../restore-delete-account-context';
import RestoreDeleteAccountStartSection from '../restore-delete-account-start-section';

// Custom utility for i18n support

// Mock useDomainStore
jest.mock('../../../../../store/domain/store', () => ({
	useDomainStore: jest.fn()
}));

describe('RestoreDeleteAccountStartSection', () => {
	const mockContextValue = {
		restoreAccountDetail: {
			name: 'testuser@demo.zextras.io',
			copyAccount: 'copyuser@demo.zextras.io',
			copyDomain: 'demo.zextras.io',
			lastAvailableStatus: true,
			hsmApply: false,
			createDate: 1742205198000,
			dateTime: 1742205198729,
			notificationReceiver: 'admin@demo.zextras.io'
		},
		setRestoreAccountDetail: jest.fn()
	};
	test('renders', async () => {
		await act(async () => {
			setup(
				<RestoreDeleteAccountContext.Provider value={mockContextValue}>
					<RestoreDeleteAccountStartSection />
				</RestoreDeleteAccountContext.Provider>
			);
		});
		expect(screen.getByText(/Date/i)).toBeInTheDocument();
	});

	test('displays correct email notifications value', async () => {
		await act(async () => {
			setup(
				<RestoreDeleteAccountContext.Provider value={mockContextValue}>
					<RestoreDeleteAccountStartSection />
				</RestoreDeleteAccountContext.Provider>
			);
		});
		expect(screen.getByLabelText(/Email Notifications/i)).toHaveValue(
			mockContextValue.restoreAccountDetail.notificationReceiver
		);
	});

	test('displays correct destination account value', async () => {
		await act(async () => {
			setup(
				<RestoreDeleteAccountContext.Provider value={mockContextValue}>
					<RestoreDeleteAccountStartSection />
				</RestoreDeleteAccountContext.Provider>
			);
		});
		const expectedDestinationAccount = `${
			mockContextValue.restoreAccountDetail.copyAccount.split('@')[0]
		}@${mockContextValue.restoreAccountDetail.copyDomain}`;
		expect(screen.getByLabelText(/Destination Account/i)).toHaveValue(expectedDestinationAccount);
	});
});
