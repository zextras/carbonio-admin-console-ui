/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe } from 'vitest';

describe.todo('GeneralOptions', () => {
	// beforeEach(() => {
	// 	jest.resetAllMocks();
	// });
	//
	// const mockChangeSwitchOption = jest.fn();
	//
	// const cosPrefAttributes: CosPrefAttributes = {
	// 	...DEFAULT_COS_PREF_ATTRIBUTES,
	// 	zimbraPrefAutoAddAddressEnabled: 'TRUE',
	// 	zimbraPrefGalAutoCompleteEnabled: 'FALSE'
	// };
	//
	// it('should render contact options correctly', () => {
	// 	setup(
	// 		<ContactOptions
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry={false}
	// 			changeSwitchOption={mockChangeSwitchOption}
	// 		/>
	// 	);
	// 	expect(screen.getByText('Contact Options')).toBeInTheDocument();
	// 	expect(screen.getByText('Enable auto-add contacts')).toBeInTheDocument();
	// 	expect(screen.getByText('Use GAL to auto-fill')).toBeInTheDocument();
	// });
	//
	// it('should call changeSwitchOption when auto-add contacts switch is clicked', async () => {
	// 	const { user } = setup(
	// 		<ContactOptions
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry={false}
	// 			changeSwitchOption={mockChangeSwitchOption}
	// 		/>
	// 	);
	//
	// 	await user.click(screen.getByText('Enable auto-add contacts'));
	//
	// 	expect(mockChangeSwitchOption).toHaveBeenCalledWith('zimbraPrefAutoAddAddressEnabled');
	// });
	//
	// it('should call changeSwitchOption when use GAL auto-fill switch is clicked', async () => {
	// 	const { user } = setup(
	// 		<ContactOptions
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry={false}
	// 			changeSwitchOption={mockChangeSwitchOption}
	// 		/>
	// 	);
	// 	await user.click(screen.getByText('Use GAL to auto-fill'));
	//
	// 	expect(mockChangeSwitchOption).toHaveBeenCalledWith('zimbraPrefGalAutoCompleteEnabled');
	// });
	//
	// it('should disable switches when readonlyCOS is true', async () => {
	// 	const { user } = setup(
	// 		<ContactOptions
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			isReadOnlyCosEntry
	// 			changeSwitchOption={mockChangeSwitchOption}
	// 		/>
	// 	);
	// 	await user.click(screen.getByText('Use GAL to auto-fill'));
	// 	await user.click(screen.getByText('Enable auto-add contacts'));
	//
	// 	expect(mockChangeSwitchOption).not.toHaveBeenCalled();
	// });
});
