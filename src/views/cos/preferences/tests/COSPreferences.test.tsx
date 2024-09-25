/* eslint-disable sonarjs/no-duplicate-string */
// noinspection DuplicatedCode

/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';
import { act } from 'react-dom/test-utils';

import { flushCache } from '../../../../services/flush-cache-service';
import { modifyCos } from '../../../../services/modify-cos-service';
import { useCosStore } from '../../../../store/cos/store';
import { useRightsStore } from '../../../../store/rights/store';
import { setup } from '../../../../tests/testUtils';
import { COSPreferences } from '../COSPreferences';

jest.mock('../../../../services/modify-cos-service', () => ({
	modifyCos: jest.fn()
}));

jest.mock('../../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

describe('COSPreferences', () => {
	beforeEach(() => {
		jest.resetAllMocks();

		useCosStore.getState().setCos({
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			name: 'default',
			isDefaultCos: true,
			a: [
				{
					n: 'zimbraId',
					_content: 'e00428a1-0c00-11d9-836a-000d93afea2a'
				},
				{
					n: 'zimbraPrefLocale',
					_content: 'en'
				}
			]
		});

		useRightsStore.getState().setRights([
			{
				type: 'cos',
				all: [
					{
						right: [
							{ n: 'assignCos' },
							{ n: 'deleteCos' },
							{ n: 'listCos' },
							{ n: 'manageZimlet' },
							{ n: 'renameCos' }
						],
						setAttrs: [{ all: true }],
						getAttrs: [{ all: true }]
					}
				]
			}
		]);
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

	test('should toggle SaveCancelBar visibility when hasChangesToSave', async () => {
		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
		await expect(screen.getByText('English - English')).toBeInTheDocument();
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

	test('should call modifyCos, flushCache and createSnackbar when Save Button is clicked', async () => {
		const mockModifyCos = modifyCos as jest.MockedFunction<typeof modifyCos>;
		mockModifyCos.mockImplementation(() => Promise.resolve({}));

		const mockFlushCache = flushCache as jest.MockedFunction<typeof flushCache>;
		mockFlushCache.mockImplementation(() => Promise.resolve({}));

		const mockCreateSnackbar = jest.fn();
		(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);

		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
		await expect(screen.getByText('English - English')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('English - English'));
		});
		await expect(screen.getByText('German - Deutsch')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('German - Deutsch'));
		});

		await expect(screen.getByText('Save')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('Save'));
		});

		await expect(mockModifyCos).toHaveBeenCalled();
		await expect(mockFlushCache).toHaveBeenCalled();
		await expect(mockCreateSnackbar).toHaveBeenCalled();
	});

	test('should not be able to modify COS preferences when COS entry is read only', async () => {
		useRightsStore.getState().setRights([
			{
				type: 'cos',
				all: [
					{
						right: [
							{ n: 'assignCos' },
							{ n: 'deleteCos' },
							{ n: 'listCos' },
							{ n: 'manageZimlet' },
							{ n: 'renameCos' }
						],
						setAttrs: [{ all: false }], // cannot set/change attributes on COS entry
						getAttrs: [{ all: true }]
					}
				]
			}
		]);

		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
		await expect(screen.getByText('English - English')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('English - English'));
		});
		await expect(screen.queryByText('German - Deutsch')).not.toBeInTheDocument();

		await expect(screen.queryByText('Save')).not.toBeInTheDocument();
		await expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
	});

	test('clicking Cancel button should reset the modifications/hide save and cancel buttons', async () => {
		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
		await expect(screen.getByText('English - English')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('English - English'));
		});
		await expect(screen.getByText('German - Deutsch')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('German - Deutsch'));
		});

		await expect(screen.getByText('Cancel')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('Cancel'));
		});

		await expect(screen.queryByText('Save')).not.toBeInTheDocument();
		await expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
	});
});
