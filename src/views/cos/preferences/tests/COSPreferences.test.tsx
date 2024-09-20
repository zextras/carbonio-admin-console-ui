/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { useCosStore } from '../../../../store/cos/store';
import { useRightsStore } from '../../../../store/rights/store';
import { setup } from '../../../../tests/testUtils';
import COSPreferences from '../COSPreferences';

jest.mock('../../../../store/cos/store', () => ({
	useCosStore: jest.fn()
}));
jest.mock('../../../../store/rights/store', () => ({
	useRightsStore: jest.fn()
}));
jest.mock('../../../../services/modify-cos-service', () => ({
	modifyCos: jest.fn()
}));
jest.mock('../../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

// jest.mock('../../../utility/utils', () => ({
// 	...jest.requireActual('../../../utility/utils'),
// 	localeList: jest.fn()
// }));

// jest
// 	.spyOn(COSPreferences.prototype, 'localeList')
// 	.mockImplementation((t: TFunction) => localeList(t));

describe('COSPreferences', () => {
	const mockSetCos = jest.fn();
	// const mockCreateSnackbar = jest.fn();
	const mockLocalesFind = jest.fn();

	beforeEach(() => {
		jest.resetAllMocks();

		(useCosStore as unknown as jest.Mock).mockReturnValue({
			cos: { a: [{ n: 'zimbraPrefLocale', _content: 'en' }] },
			setCos: mockSetCos
		});

		(useRightsStore as unknown as jest.Mock).mockReturnValue({
			rights: [{ type: 'COS', all: [{ setAttrs: [{ all: true }] }] }]
		});

		// const localesItems: SelectItem[] = [
		// 	{ label: 'English', value: 'en' },
		// 	{ label: 'Spanish', value: 'es' }
		// ];

		// (localeList as unknown as jest.Mock).mockReturnValue({
		// 	locales: localesItems,
		// 	find: mockLocalesFind
		// });
	});

	it('should render the component correctly', () => {
		setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

		expect(screen.getByText('Preferences')).toBeInTheDocument();
		expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Mail Options')).toBeInTheDocument();
		expect(screen.getByText('Receiving Mails')).toBeInTheDocument();
		expect(screen.getByText('Forwarding')).toBeInTheDocument();
		expect(screen.getByText('Sending Mails')).toBeInTheDocument();
		expect(screen.getByText('Contact Options')).toBeInTheDocument();
	});

	// it('should handle save action', async () => {
	// 	const { user } = setup(<COSPreferences />);
	//
	// 	expect(screen.getByText('Language')).toBeInTheDocument();
	//
	// 	await user.click(screen.getByText('English - English'));
	// 	await user.click(screen.getByText('Spanish'));
	//
	// 	const saveButton = screen.getByText('Save');
	// 	await user.click(saveButton);
	//
	// 	// Ensure modifyCos and flushCache are called
	// 	expect(modifyCos).toHaveBeenCalled();
	// 	expect(flushCache).toHaveBeenCalledWith('cos', 'id', expect.any(String));
	//
	// 	// Ensure the snackbar is shown on success
	// 	expect(mockCreateSnackbar).toHaveBeenCalledWith(
	// 		expect.objectContaining({ key: 'success', type: 'success' })
	// 	);
	//
	// 	// Ensure the setCos method is called with the updated COS data
	// 	expect(mockSetCos).toHaveBeenCalled();
	// });
	//
	// it('should handle cancel action', async () => {
	// 	const { user } = setup(<COSPreferences />);
	//
	// 	const cancelButton = screen.getByText('Cancel');
	// 	await user.click(cancelButton);
	//
	// 	// Check that initial values are reset (in this case check if zimbraPrefLocale gets reset)
	// 	expect(screen.getByText('en_US')).toBeInTheDocument(); // Based on mock cosInformation
	// });
	//
	// it('should set isDirty flag when changes are made', async () => {
	// 	const { user } = setup(<COSPreferences />);
	//
	// 	// Simulate making changes (e.g., changing the locale or switching a setting)
	// 	const mailSwitch = screen.getByLabelText('User can specify forwarding address');
	// 	await user.click(mailSwitch);
	//
	// 	// Check that the SaveCancelBar becomes enabled due to the dirty state
	// 	expect(screen.getByText('Save')).not.toBeDisabled();
	// 	expect(screen.getByText('Cancel')).not.toBeDisabled();
	// });
	//
	// it('should disable switches when readonlyCOS is true', () => {
	// 	(useRightsStore as unknown as jest.Mock).mockReturnValue({
	// 		rights: [{ type: 'COS', all: [{ setAttrs: [{ all: false }] }] }]
	// 	});
	//
	// 	setup(<COSPreferences />);
	//
	// 	const mailSwitch = screen.getByLabelText('User can specify forwarding address');
	// 	expect(mailSwitch).toBeDisabled();
	// });

	// it('should handle attribute changes in sections', async () => {
	// 	const { user } = setup(<COSPreferences />);
	//
	// 	// Simulate changing an attribute in GeneralOptions (e.g., changing the locale)
	// 	const localeSelect = screen.getByLabelText('Preferred Language');
	// 	await user.selectOptions(localeSelect, 'fr_FR');
	//
	// 	// Check that the state is updated
	// 	expect(localeSelect.value).toBe('fr_FR');
	//
	// 	// Simulate changing a switch in MailOptions
	// 	const mailSwitch = screen.getByLabelText('User can specify forwarding address');
	// 	await user.click(mailSwitch);
	//
	// 	// Ensure the switch toggles the value correctly
	// 	expect(mailSwitch.checked).toBe(true);
	// });
});
