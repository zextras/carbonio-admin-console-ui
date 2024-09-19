/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { CosPrefAttributes } from '../../../../../types';
import { setup } from '../../../../tests/testUtils';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../../constants';
import SendingMails from '../SendingMails';

describe('GeneralOptions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockChangeSwitchOption = jest.fn();
	const mockOnMailSendReadReceipts = jest.fn();

	const cosPrefAttributes: CosPrefAttributes = {
		...DEFAULT_COS_PREF_ATTRIBUTES,
		zimbraPrefSaveToSent: 'TRUE',
		zimbraAllowAnyFromAddress: 'FALSE',
		zimbraPrefMailSendReadReceipts: 'never'
	};

	it('should render correctly with initial value', () => {
		setup(
			<SendingMails
				cosPrefAttributes={cosPrefAttributes}
				readonlyCOS={false}
				onMailSendReadReceipts={mockOnMailSendReadReceipts}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		expect(screen.getByText('Sending Mails')).toBeInTheDocument();
		expect(screen.getByText('Save to sent')).toBeInTheDocument();
		expect(screen.getByText('Allow sending from any address')).toBeInTheDocument();
		expect(screen.getByText('Read Receipt settings')).toBeInTheDocument();
		expect(screen.getByText('Never send a read receipt')).toBeInTheDocument();
	});

	it('should call changeSwitchOption when "Save to sent" switch is clicked', async () => {
		const { user } = setup(
			<SendingMails
				cosPrefAttributes={cosPrefAttributes}
				readonlyCOS={false}
				onMailSendReadReceipts={mockOnMailSendReadReceipts}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		await user.click(screen.getByText('Save to sent'));

		expect(mockChangeSwitchOption).toHaveBeenCalledWith('zimbraPrefSaveToSent');
	});

	it('should call onMailSendReadReceipts when a new read receipt option is selected', async () => {
		const { user } = setup(
			<SendingMails
				cosPrefAttributes={cosPrefAttributes}
				readonlyCOS={false}
				onMailSendReadReceipts={mockOnMailSendReadReceipts}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('Never send a read receipt'));
		await user.click(screen.getByText('Always send a read receipt'));

		expect(mockOnMailSendReadReceipts).toHaveBeenCalledWith('always');
	});

	// TODO: disabled is handled by css
	// it('should disable controls if readonlyCOS is true', () => {
	// 	setup(
	// 		<SendingMails
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			readonlyCOS
	// 			onMailSendReadReceipts={mockOnMailSendReadReceipts}
	// 			changeSwitchOption={mockChangeSwitchOption}
	// 		/>
	// 	);
	// 	expect(screen.getByText('Save to sent')).toBeDisabled();
	// 	expect(screen.getByText('Allow sending from any address')).toBeDisabled();

	// 	expect(screen.getByText('Never send a read receipt').closest('button')).toBeDisabled();
	// });

	it('should not call changeSwitchOption when disabled switch is clicked', async () => {
		const { user } = setup(
			<SendingMails
				cosPrefAttributes={cosPrefAttributes}
				readonlyCOS
				onMailSendReadReceipts={mockOnMailSendReadReceipts}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('Save to sent'));

		expect(mockChangeSwitchOption).not.toHaveBeenCalled();
	});
});
