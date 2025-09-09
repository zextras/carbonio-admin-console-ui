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
	// const mockOnCosAttributeChanged = jest.fn();
	// const cosPrefAttributes: CosPrefAttributes = {
	// 	...DEFAULT_COS_PREF_ATTRIBUTES,
	// 	zimbraPrefLocale: 'en'
	// };
	// const locales: SelectItem[] = [
	// 	{ label: 'English', value: 'en' },
	// 	{ label: 'Spanish', value: 'es' }
	// ];
	//
	// it('should render correctly with the given props', () => {
	// 	setup(
	// 		<GeneralOptions
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			locales={locales}
	// 			isReadOnlyCosEntry={false}
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	expect(screen.getByText('General Options')).toBeInTheDocument();
	// 	expect(screen.getByText('Language')).toBeInTheDocument();
	// 	expect(screen.getByText('English')).toBeInTheDocument();
	// });
	//
	// it('should call onPrefLocaleChange when a different locale is selected', async () => {
	// 	const { user } = setup(
	// 		<GeneralOptions
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			locales={locales}
	// 			isReadOnlyCosEntry={false}
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	expect(screen.getByText('Language')).toBeInTheDocument();
	//
	// 	await user.click(screen.getByText('English'));
	// 	await user.click(screen.getByText('Spanish'));
	//
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledTimes(1);
	// 	expect(mockOnCosAttributeChanged).toHaveBeenCalledWith('zimbraPrefLocale', 'es');
	// });
	//
	// it('should disable the select dropdown when readonlyCOS is true', async () => {
	// 	const { user } = setup(
	// 		<GeneralOptions
	// 			cosPrefAttributes={cosPrefAttributes}
	// 			locales={locales}
	// 			isReadOnlyCosEntry
	// 			onCosAttributeChanged={mockOnCosAttributeChanged}
	// 		/>
	// 	);
	//
	// 	expect(screen.getByText('Language')).toBeInTheDocument();
	//
	// 	await user.click(screen.getByText('English'));
	//
	// 	expect(mockOnCosAttributeChanged).not.toHaveBeenCalled();
	// });
});
