/* eslint-disable prettier/prettier,sonarjs/no-duplicate-string */
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
import ReceivingMails from '../ReceivingMails';

describe('ReceivingMails', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockOnPollingIntervalChange = jest.fn();
	const mockOnMailMinPollingIntervalChange = jest.fn();
	const cosPrefAttributes: CosPrefAttributes = {
		...DEFAULT_COS_PREF_ATTRIBUTES,
		zimbraPrefMailPollingInterval: '5m',
		zimbraMailMinPollingInterval: '2m'
	};

	it('should render correctly with the given props', () => {
		setup(
			<ReceivingMails
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onPollingIntervalChange={mockOnPollingIntervalChange}
				onMailMinPollingIntervalChange={mockOnMailMinPollingIntervalChange}
			/>
		);

		expect(screen.getByText('Receiving Mails')).toBeInTheDocument();
		expect(screen.getByText('Minimum mail polling interval')).toBeInTheDocument();
		expect(screen.getByText('Polling interval')).toBeInTheDocument();
		expect(screen.getByDisplayValue('2')).toBeInTheDocument();
		expect(screen.getByText('Minutes')).toBeInTheDocument();
		expect(screen.getByText('5 minutes')).toBeInTheDocument();
	});

	it('should call onMailMinPollingIntervalChange when the minimum polling interval is changed', async () => {
		const { user } = setup(
			<ReceivingMails
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onPollingIntervalChange={mockOnPollingIntervalChange}
				onMailMinPollingIntervalChange={mockOnMailMinPollingIntervalChange}
			/>
		);

		const input = screen.getByLabelText('Minimum mail polling interval');
		await user.clear(input);
		await user.type(input, '3'); // input event count:  1 for clear input event + 1 for each char count = 2

		expect(mockOnMailMinPollingIntervalChange).toHaveBeenCalledTimes(2);
		expect(mockOnMailMinPollingIntervalChange).toHaveBeenCalledWith('3m');
	});

	it('should call onPollingIntervalChange when a different polling interval is selected', async () => {
		const { user } = setup(
			<ReceivingMails
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onPollingIntervalChange={mockOnPollingIntervalChange}
				onMailMinPollingIntervalChange={mockOnMailMinPollingIntervalChange}
			/>
		);

		expect(screen.getByText('Polling interval')).toBeInTheDocument();

		await user.click(screen.getByText('5 minutes'));
		await user.click(screen.getByText('3 minutes'));

		expect(mockOnPollingIntervalChange).toHaveBeenCalledTimes(1);
		expect(mockOnPollingIntervalChange).toHaveBeenCalledWith('3m');
	});

	it('should disable input and select fields when isReadonlyCOSEntry is true', async () => {
		const { user } = setup(
			<ReceivingMails
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry
				onPollingIntervalChange={mockOnPollingIntervalChange}
				onMailMinPollingIntervalChange={mockOnMailMinPollingIntervalChange}
			/>
		);

		expect(screen.getByText('Polling interval')).toBeInTheDocument();
		await user.click(screen.getByText('5 minutes'));
		expect(mockOnPollingIntervalChange).not.toHaveBeenCalled();

		const minimumMailPoolingIntervalInput = screen.getByLabelText('Minimum mail polling interval');
		await user.type(minimumMailPoolingIntervalInput, '56');
		expect(mockOnMailMinPollingIntervalChange).not.toHaveBeenCalled();
	});
});
