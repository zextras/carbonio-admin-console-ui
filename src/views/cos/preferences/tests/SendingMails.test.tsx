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
import { SendingMails } from '../SendingMails';

describe('SendingMails', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockChangeSwitchOption = jest.fn();
	const mockOnCosAttributeChanged = jest.fn();

	const cosPrefAttributes: CosPrefAttributes = {
		...DEFAULT_COS_PREF_ATTRIBUTES,
		zimbraPrefSaveToSent: 'TRUE',
		zimbraPrefMailSendReadReceipts: 'never'
	};

	it('should render correctly with initial value', () => {
		setup(
			<SendingMails
				cosPrefAttributes={cosPrefAttributes}
				isReadOnlyCosEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
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
				isReadOnlyCosEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
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
				isReadOnlyCosEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('Never send a read receipt'));
		await user.click(screen.getByText('Always send a read receipt'));

		expect(mockOnCosAttributeChanged).toHaveBeenCalledWith(
			'zimbraPrefMailSendReadReceipts',
			'always'
		);
	});

	it('should disable controls if readonlyCOS is true', async () => {
		const { user } = setup(
			<SendingMails
				cosPrefAttributes={cosPrefAttributes}
				isReadOnlyCosEntry
				onCosAttributeChanged={mockOnCosAttributeChanged}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		await user.click(screen.getByText('Save to sent'));
		await user.click(screen.getByText('Allow sending from any address'));
		expect(mockChangeSwitchOption).not.toHaveBeenCalled();

		expect(screen.getByText('Read Receipt settings')).toBeInTheDocument();
		await user.click(screen.getByText('Never send a read receipt'));
		expect(screen.queryByText('Ask me')).not.toBeInTheDocument();
	});
	it('should not call changeSwitchOption when disabled switch is clicked', async () => {
		const { user } = setup(
			<SendingMails
				cosPrefAttributes={cosPrefAttributes}
				isReadOnlyCosEntry
				onCosAttributeChanged={mockOnCosAttributeChanged}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('Save to sent'));

		expect(mockChangeSwitchOption).not.toHaveBeenCalled();
	});
});
