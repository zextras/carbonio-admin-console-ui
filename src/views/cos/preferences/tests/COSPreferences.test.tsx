/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { Attribute, Cos } from '../../../../../types';
import { useCosStore } from '../../../../store/cos/store';
import { Right, useRightsStore } from '../../../../store/rights/store';
import { setup } from '../../../../tests/testUtils';
import { COSPreferences } from '../COSPreferences';

jest.mock('../../../../services/modify-cos-service', () => ({
	modifyCos: jest.fn()
}));
jest.mock('../../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

describe('COSPreferences', () => {
	beforeEach(() => {
		jest.resetAllMocks();

		const zimbraPrefLocale: Attribute = {
			n: 'zimbraPrefLocale',
			_content: 'en'
		};

		const cos: Cos = {
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			name: 'default',
			isDefaultCos: true,
			a: Array.of(zimbraPrefLocale)
		};

		useCosStore.getState().setCos(cos);

		const right: Right = {
			type: 'cos',
			all: [
				{
					right: [
						{
							n: 'assignCos'
						},
						{
							n: 'deleteCos'
						},
						{
							n: 'listCos'
						},
						{
							n: 'manageZimlet'
						},
						{
							n: 'renameCos'
						}
					],
					setAttrs: [
						{
							all: true
						}
					],
					getAttrs: [
						{
							all: true
						}
					]
				}
			]
		};

		useRightsStore.getState().setRights(Array.of(right));
	});

	it('should render the component correctly', () => {
		setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

		expect(screen.getByText('Preferences')).toBeInTheDocument();
		expect(screen.getByText('English - English')).toBeInTheDocument();

		expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Mail Options')).toBeInTheDocument();
		expect(screen.getByText('Receiving Mails')).toBeInTheDocument();
		expect(screen.getByText('Forwarding')).toBeInTheDocument();
		expect(screen.getByText('Sending Mails')).toBeInTheDocument();
		expect(screen.getByText('Contact Options')).toBeInTheDocument();
	});

	it('should toggle SaveCancelBar visibility when hasChangesToSave', async () => {
		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

		expect(screen.getByText('Preferences')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('English - English'));
		});

		await expect(screen.getByText('German - Deutsch')).toBeInTheDocument();

		await act(async () => {
			await user.click(screen.getByText('German - Deutsch'));
		});

		await expect(screen.getByText('Save')).toBeInTheDocument();
		await expect(screen.getByText('Cancel')).toBeInTheDocument();
	});
});
