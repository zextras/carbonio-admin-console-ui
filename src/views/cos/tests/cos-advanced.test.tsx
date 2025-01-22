/* eslint-disable sonarjs/no-duplicate-string */
// noinspection DuplicatedCode

/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { act, screen } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';

import * as setCoreAttributes from '../../../services/set-core-attributes';
import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { useCosStore } from '../../../store/cos/store';
import { useRightsStore } from '../../../store/rights/store';
import { setup } from '../../../tests/testUtils';
import CosAdvanced from '../cos-advanced';

/*
/═══════════════════════════════════════════════════\
|          			Config Mocks     				|
\═══════════════════════════════════════════════════/
*/

jest.mock('../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

jest.mock('../../../services/modify-cos-service', () => ({
	modifyCos: (): Promise<any> =>
		Promise.resolve({
			_jsns: 'urn:zimbraAdmin',
			cos: {
				id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
				a: [
					{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
					{ n: 'zimbraPrefLocale', _content: 'en' },
					{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' }
				]
			}
		})
}));

const initialBackupEnabledValue = false;
const initialBackupSelfUndeleteAllowedValue = true;
jest.mock('../../../services/get-core-attributes', () => ({
	getCoreAttributes: (): Promise<any> =>
		Promise.resolve({
			attributes: {
				backupEnabled: [
					{
						configName: 'default',
						configType: 'cos',
						value: initialBackupEnabledValue
					}
				],
				backupSelfUndeleteAllowed: [
					{
						configName: 'default',
						configType: 'cos',
						value: initialBackupSelfUndeleteAllowedValue
					}
				]
			}
		})
}));
jest.mock('../../../services/set-core-attributes', () => ({
	setCoreAttributes: jest.fn()
}));

jest.mock('../../../services/get-file-quota', () => ({
	getFileQuotaById: (): Promise<any> =>
		Promise.resolve({
			limit: 0
		})
}));
jest.mock('../../../services/set-file-quota-limit', () => ({
	setFileQuotaLimitById: jest.fn()
}));
jest.mock('../../../services/reset-file-quota-limit', () => ({
	resetFileQuotaLimitById: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

/*
/═══════════════════════════════════════════════════\
|          			Config Stores     				|
\═══════════════════════════════════════════════════/
*/
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

const setupAdvanced = (isAdvanced: boolean): void => {
	useAuthIsAdvanced.getState().setIsAdvanced(isAdvanced);
};

/*
/═══════════════════════════════════════════════════\
|          		Utility functions					|
\═══════════════════════════════════════════════════/
*/
async function renderComponent(component: React.ReactElement): Promise<any> {
	return act(async (): Promise<any> => setup(component));
}

const enableAdvanced = (): void => setupAdvanced(true);
const disableAdvanced = (): void => setupAdvanced(false);

const spySetCoreAttributes = (): any =>
	jest.spyOn(setCoreAttributes, 'setCoreAttributes').mockImplementation((_) => Promise.resolve({}));

const createAdvancedCosValues = (
	backupEnabled: boolean,
	backupSelfUndeleteAllowed: boolean
): any => ({
	backupEnabled: {
		objectName: 'default',
		configType: 'cos',
		value: backupEnabled
	},
	backupSelfUndeleteAllowed: {
		objectName: 'default',
		configType: 'cos',
		value: backupSelfUndeleteAllowed
	}
});

/*
/═══════════════════════════════════════════════════\
|          			  Tests							|
\═══════════════════════════════════════════════════/
*/

describe('CosAdvanced', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		setupCosStore();
		setupRightsStore();
		enableAdvanced();
	});

	it('should render the component correctly', async () => {
		await renderComponent(<CosAdvanced />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Advanced')).toBeInTheDocument();
		expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Forwarding')).toBeInTheDocument();
		expect(screen.getByText('Quotas')).toBeInTheDocument();
		expect(screen.getByText('Password')).toBeInTheDocument();
		expect(screen.getByText('Failed Login Policy')).toBeInTheDocument();
		expect(screen.getByText('Timeout Policy')).toBeInTheDocument();
		expect(screen.getByText('Email Retention Policy')).toBeInTheDocument();
	});

	it('should render Advanced toggles', async () => {
		await renderComponent(<CosAdvanced />);

		expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Backup')).toBeInTheDocument();
		expect(screen.getByText('Allow user to restore messages')).toBeInTheDocument();
	});

	it('should not render Advanced toggles', async () => {
		disableAdvanced();

		await renderComponent(<CosAdvanced />);

		expect(screen.queryByText('General Options')).not.toBeInTheDocument();
		expect(screen.queryByText('Backup')).not.toBeInTheDocument();
		expect(screen.queryByText('Allow user to restore messages')).not.toBeInTheDocument();
	});

	it('should toggle/untoggle Backup based on initial state', async () => {
		const mockCreateSnackbar = jest.fn();
		(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
		const setCoreAttrs = spySetCoreAttributes();
		const { user } = await renderComponent(<CosAdvanced />);

		// Toggle/Untoggle Backup
		await user.click(screen.getByText('Backup'));

		await user.click(screen.getByText('Save'));

		const expectedBackupEnabledValue = !initialBackupEnabledValue;
		expect(setCoreAttrs).toHaveBeenCalledWith(
			createAdvancedCosValues(expectedBackupEnabledValue, initialBackupSelfUndeleteAllowedValue)
		);

		const expectedSnackbarOptions = {
			key: 'success',
			severity: 'success',
			label: 'The change has been saved successfully',
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		};
		expect(mockCreateSnackbar).toHaveBeenCalledWith(expectedSnackbarOptions);
	});
});
