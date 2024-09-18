/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { SelectItem } from '@zextras/carbonio-design-system';

import { CosPrefAttributes } from '../../../../../types';
import { setup } from '../../../../tests/testUtils';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../../constants';
import GeneralOptions from '../GeneralOptions';

describe('GeneralOptions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockOnPrefLocaleChange = jest.fn();
	const cosPrefAttributes: CosPrefAttributes = {
		...DEFAULT_COS_PREF_ATTRIBUTES,
		zimbraPrefLocale: 'en'
	};
	const locales: SelectItem[] = [
		{ label: 'English', value: 'en' },
		{ label: 'Spanish', value: 'es' }
	];

	it('should render correctly with the given props', () => {
		setup(
			<GeneralOptions
				cosPrefAttributes={cosPrefAttributes}
				locales={locales}
				readonlyCOS={false}
				onPrefLocaleChange={mockOnPrefLocaleChange}
			/>
		);

		expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Language')).toBeInTheDocument();
		expect(screen.getByText('English')).toBeInTheDocument();
	});

	it('should call onPrefLocaleChange when a different locale is selected', async () => {
		const { user } = setup(
			<GeneralOptions
				cosPrefAttributes={cosPrefAttributes}
				locales={locales}
				readonlyCOS={false}
				onPrefLocaleChange={mockOnPrefLocaleChange}
			/>
		);

		expect(screen.getByText('Language')).toBeInTheDocument();

		await user.click(screen.getByText('English'));
		await user.click(screen.getByText('Spanish'));

		expect(mockOnPrefLocaleChange).toHaveBeenCalledTimes(1);
		expect(mockOnPrefLocaleChange).toHaveBeenCalledWith('es');
	});

	it('should disable the select dropdown when readonlyCOS is true', async () => {
		const { user } = setup(
			<GeneralOptions
				cosPrefAttributes={cosPrefAttributes}
				locales={locales}
				readonlyCOS
				onPrefLocaleChange={mockOnPrefLocaleChange}
			/>
		);

		expect(screen.getByText('Language')).toBeInTheDocument();

		await user.click(screen.getByText('English'));

		expect(mockOnPrefLocaleChange).not.toHaveBeenCalled();
	});
});
