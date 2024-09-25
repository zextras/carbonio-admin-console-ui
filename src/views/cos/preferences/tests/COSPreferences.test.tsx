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
	const setupCosStore = (): void => {
		useCosStore.getState().setCos({
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			name: 'default',
			isDefaultCos: true,
			a: [
				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
				{ n: 'zimbraPrefLocale', _content: 'en' },
				{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' }
			]
		});
	};

	const setupRightsStore = (): void => {
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
	};

	beforeEach(() => {
		jest.resetAllMocks();
		setupCosStore();
		setupRightsStore();
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

	test('should toggle Save/Cancel bar visibility when there are changes to save', async () => {
		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
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

	test('should call modifyCos, flushCache, and createSnackbar when Save button is clicked', async () => {
		const mockModifyCos = modifyCos as jest.MockedFunction<typeof modifyCos>;
		const mockFlushCache = flushCache as jest.MockedFunction<typeof flushCache>;
		const mockCreateSnackbar = jest.fn();
		(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);

		mockModifyCos.mockResolvedValue({});
		mockFlushCache.mockResolvedValue({});

		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
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

		const expectedModifyCosBody = {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
			a: expect.arrayContaining([
				expect.objectContaining({
					n: 'zimbraPrefLocale',
					_content: 'de'
				})
			])
		};
		expect(mockModifyCos).toHaveBeenCalledWith(expect.objectContaining(expectedModifyCosBody));

		expect(mockFlushCache).toHaveBeenCalled();

		const expectedSnackbarOptions = {
			key: 'success',
			type: 'success',
			label: 'The change has been saved successfully',
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		};
		expect(mockCreateSnackbar).toHaveBeenCalledWith(expectedSnackbarOptions);
	});

	test('should not allow modification of COS preferences when COS entry is read-only', async () => {
		const readOnlyRights = [
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
		];
		useRightsStore.getState().setRights(readOnlyRights);

		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
		await act(async () => {
			await user.click(screen.getByText('English - English'));
		});
		expect(screen.queryByText('German - Deutsch')).not.toBeInTheDocument();

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
	});

	test('clicking Cancel button should reset modifications and hide save/cancel buttons', async () => {
		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Preferences')).toBeInTheDocument();

		// Change the locale from English to German
		await act(async () => {
			await user.click(screen.getByText('English - English'));
		});
		await act(async () => {
			await user.click(screen.getByText('German - Deutsch'));
		});

		await expect(screen.getByText('Cancel')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('Cancel'));
		});

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
	});

	test('should call handleSwitchOptionChange, modifyCos, flushCache, and createSnackbar when toggling a switch', async () => {
		const mockModifyCos = modifyCos as jest.MockedFunction<typeof modifyCos>;
		const mockFlushCache = flushCache as jest.MockedFunction<typeof flushCache>;
		const mockCreateSnackbar = jest.fn();
		(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);

		mockModifyCos.mockResolvedValue({});
		mockFlushCache.mockResolvedValue({});

		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Mail Options')).toBeInTheDocument();

		const currentZimbraPrefMessageViewHtmlPreferred = useCosStore
			.getState()
			.cos?.a?.find((attr) => attr.n === 'zimbraPrefMessageViewHtmlPreferred')?._content;
		expect(currentZimbraPrefMessageViewHtmlPreferred).toBe('TRUE');

		// Change the "View mail as HTML" option from TRUE to FALSE
		await act(async () => {
			await user.click(screen.getByText('View mail as HTML (when possible)'));
		});

		await expect(screen.getByText('Save')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('Save'));
		});

		const expectedModifyCosBody = {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
			a: expect.arrayContaining([
				expect.objectContaining({
					n: 'zimbraPrefMessageViewHtmlPreferred',
					_content: 'FALSE'
				})
			])
		};
		expect(mockModifyCos).toHaveBeenCalledWith(expect.objectContaining(expectedModifyCosBody));

		expect(mockFlushCache).toHaveBeenCalled();

		const expectedSnackbarOptions = {
			key: 'success',
			type: 'success',
			label: 'The change has been saved successfully',
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		};
		expect(mockCreateSnackbar).toHaveBeenCalledWith(expectedSnackbarOptions);
	});

	test('should show snackBar with correct error when modifyCos call fails', async () => {
		const mockModifyCos = modifyCos as jest.MockedFunction<typeof modifyCos>;
		const mockFlushCache = flushCache as jest.MockedFunction<typeof flushCache>;
		const mockCreateSnackbar = jest.fn();
		(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);

		// Mock the implementation to throw an error
		mockModifyCos.mockRejectedValue(new Error('Something went wrong. Please try again.'));
		mockFlushCache.mockResolvedValue({});

		const { user } = setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Mail Options')).toBeInTheDocument();

		// Change the "View mail as HTML" option from TRUE to FALSE
		await act(async () => {
			await user.click(screen.getByText('View mail as HTML (when possible)'));
		});

		await expect(screen.getByText('Save')).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByText('Save'));
		});

		// Check that the Snackbar is called with an error message
		const expectedSnackbarOptions = {
			key: 'error',
			type: 'error',
			label: 'Something went wrong. Please try again.',
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		};
		expect(mockCreateSnackbar).toHaveBeenCalledWith(expectedSnackbarOptions);
	});
});
