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
import { ForwardingOptions } from '../ForwardingOptions';

describe('ForwardingOptions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockChangeSwitchOption = jest.fn();
	const cosPrefAttributes: CosPrefAttributes = {
		...DEFAULT_COS_PREF_ATTRIBUTES,
		zimbraFeatureMailForwardingEnabled: 'TRUE',
		zimbraFeatureMailForwardingInFiltersEnabled: 'FALSE'
	};

	it('should render correctly with the given props', async () => {
		setup(
			<ForwardingOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadOnlyCosEntry={false}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		expect(screen.getByText('Forwarding')).toBeInTheDocument();
		expect(screen.getByText('User can specify forwarding address')).toBeInTheDocument();
		expect(screen.getByText('User can specify mail forwarding filter')).toBeInTheDocument();
	});

	it('should call changeSwitchOption with the correct key when the forwarding switch is clicked', async () => {
		const { user } = setup(
			<ForwardingOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadOnlyCosEntry={false}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		const forwardingSwitch = screen.getByText('User can specify forwarding address');

		await user.click(forwardingSwitch);
		expect(mockChangeSwitchOption).toHaveBeenCalledWith('zimbraFeatureMailForwardingEnabled');
	});

	it('should call changeSwitchOption with the correct key when the mail forwarding filter switch is clicked', async () => {
		const { user } = setup(
			<ForwardingOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadOnlyCosEntry={false}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		const filterSwitch = screen.getByText('User can specify mail forwarding filter');

		await user.click(filterSwitch);
		expect(mockChangeSwitchOption).toHaveBeenCalledWith(
			'zimbraFeatureMailForwardingInFiltersEnabled'
		);
	});

	it('should disable switches when isReadonlyCOSEntry is true', async () => {
		const { user } = setup(
			<ForwardingOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadOnlyCosEntry
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		const filterSwitch = screen.getByText('User can specify mail forwarding filter');
		await user.click(filterSwitch);
		expect(mockChangeSwitchOption).not.toHaveBeenCalled();

		const forwardingSwitch = screen.getByText('User can specify forwarding address');
		await user.click(forwardingSwitch);
		expect(mockChangeSwitchOption).not.toHaveBeenCalled();
	});
});
