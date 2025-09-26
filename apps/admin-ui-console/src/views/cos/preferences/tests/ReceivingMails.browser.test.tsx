/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe } from 'vitest';

describe.skip('ReceivingMails', () => {
	// beforeEach(() => {
	// 	jest.resetAllMocks();
	// });
	//
	// const mockOnCosAttributeChanged = jest.fn();
	// const cosPrefAttributes: CosPrefAttributes = {
	// 	...DEFAULT_COS_PREF_ATTRIBUTES,
	// 	zimbraPrefMailPollingInterval: '5m',
	// 	zimbraMailMinPollingInterval: '2m'
	// };
	//
	// it('should render correctly with the given props', () => {
	// 	setup(
	// 		<ReceivingMails
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry={false}
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	expect(screen.getByText('Receiving Mails')).toBeInTheDocument();
	// 	expect(screen.getByText('Minimum mail polling interval')).toBeInTheDocument();
	// 	expect(screen.getByText('Polling interval')).toBeInTheDocument();
	// 	expect(screen.getByDisplayValue('2')).toBeInTheDocument();
	// 	expect(screen.getByText('Minutes')).toBeInTheDocument();
	// 	expect(screen.getByText('5 minutes')).toBeInTheDocument();
	// });
	//
	// it('should call onMailMinPollingIntervalChange when the minimum polling interval is changed', async () => {
	// 	const { user } = setup(
	// 		<ReceivingMails
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry={false}
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	const input = screen.getByLabelText('Minimum mail polling interval');
	// 	await user.clear(input);
	// 	await user.type(input, '3'); // input event count:  1 for clear input event + 1 for each char count = 2
	//
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledTimes(2);
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledWith('zimbraMailMinPollingInterval', '3m');
	// });
	//
	// it('should call onPollingIntervalChange when a different polling interval is selected', async () => {
	// 	const { user } = setup(
	// 		<ReceivingMails
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry={false}
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	expect(screen.getByText('Polling interval')).toBeInTheDocument();
	//
	// 	await user.click(screen.getByText('5 minutes'));
	// 	await user.click(screen.getByText('3 minutes'));
	//
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledTimes(1);
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledWith('zimbraPrefMailPollingInterval', '3m');
	// });
	//
	// it('should call onCosAttributeChanged when a prefMailPollingIntervalType is changed', async () => {
	// 	const { user } = setup(
	// 		<ReceivingMails
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry={false}
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	expect(screen.getByText('Days / Hours / Minutes / Sec')).toBeInTheDocument();
	//
	// 	await user.click(screen.getByText('Minutes'));
	// 	await user.click(screen.getByText('Hours'));
	//
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledTimes(1);
	// 	// onPrefMailPollingIntervalTypeChange causes the time type to change, it added the type to zimbraMailMinPollingInterval
	// 	// value hence, the value is changed to 2h from 2m
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledWith('zimbraMailMinPollingInterval', '2h');
	// });
	//
	// it('should disable input and select fields when isReadonlyCOSEntry is true', async () => {
	// 	const { user } = setup(
	// 		<ReceivingMails
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	expect(screen.getByText('Polling interval')).toBeInTheDocument();
	// 	await user.click(screen.getByText('5 minutes'));
	// 	expect(mockOnCosAttributeChanged).not.toHaveBeenCalled();
	//
	// 	const minimumMailPoolingIntervalInput = screen.getByLabelText('Minimum mail polling interval');
	// 	await user.type(minimumMailPoolingIntervalInput, '56');
	// 	expect(mockOnCosAttributeChanged).not.toHaveBeenCalled();
	// });
});
