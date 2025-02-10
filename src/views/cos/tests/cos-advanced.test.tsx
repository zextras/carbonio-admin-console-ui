/* eslint-disable sonarjs/no-duplicate-string */
// noinspection DuplicatedCode

/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { act, screen, within } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';

import { ZIMBRA_ADMIN_URN } from '../../../constants';
import { modifyCos } from '../../../services/modify-cos-service';
import * as setCoreAttributes from '../../../services/set-core-attributes';
import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { useCosStore } from '../../../store/cos/store';
import { useRightsStore } from '../../../store/rights/store';
import { setup } from '../../../tests/testUtils';
import { AccountType } from '../../domain/manange/accounts/account-types/account-types';
import CosAdvanced from '../cos-advanced';

/*
/═══════════════════════════════════════════════════\
|          			Config Mocks     				|
\═══════════════════════════════════════════════════/
*/

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

jest.mock('../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

jest.mock('../../../services/modify-cos-service', () => ({
	modifyCos: jest.fn()
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
			limit: 1
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
		id: COS_ID,
		name: 'default',
		isDefaultCos: true,
		a: [
			{ n: 'zimbraId', _content: COS_ID },
			{ n: 'zimbraPrefLocale', _content: 'en' },
			{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' },
			{ n: 'zimbraMailForwardingAddressMaxLength', _content: '4096' }
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
|          			Utilities						|
\═══════════════════════════════════════════════════/
*/
async function renderComponent(component: React.ReactElement): Promise<any> {
	return act(async (): Promise<any> => setup(component));
}

const enableAdvanced = (): void => setupAdvanced(true);
const disableAdvanced = (): void => setupAdvanced(false);

const spySetCoreAttributes = (): any =>
	jest.spyOn(setCoreAttributes, 'setCoreAttributes').mockImplementation((_) => Promise.resolve({}));

const buildAdvancedCosValues = (
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

const mock = (fn: any): jest.MockedFunction<(body: any) => Promise<any>> =>
	fn as jest.MockedFunction<typeof fn>;

const getCosAttributeValue = (attrName: keyof AccountType): any =>
	useCosStore.getState().cos?.a?.find((attr) => attr.n === attrName)?._content;

const expectedModifyCosBody = (attrName: keyof AccountType, value: any): any =>
	expect.objectContaining({
		_jsns: ZIMBRA_ADMIN_URN,
		id: { _content: COS_ID },
		a: expect.arrayContaining([
			expect.objectContaining({
				n: attrName,
				_content: value
			})
		])
	});

const successSnackbar = {
	key: 'success',
	severity: 'success',
	label: 'The change has been saved successfully',
	autoHideTimeout: 3000,
	hideButton: true,
	replace: true
};

const defaultModifyCosBody = {
	_jsns: ZIMBRA_ADMIN_URN,
	cos: {
		id: COS_ID,
		a: []
	}
};

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

	describe('COS General Options', () => {
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
			expect(screen.getByText('Enable / Disable Backup')).toBeInTheDocument();
			expect(screen.getByText('Allow user to restore messages')).toBeInTheDocument();
		});

		it('should not render Advanced toggles when is not an Advanced environment', async () => {
			disableAdvanced();

			await renderComponent(<CosAdvanced />);

			expect(screen.queryByText('General Options')).not.toBeInTheDocument();
			expect(screen.queryByText('Enable / Disable Backup')).not.toBeInTheDocument();
			expect(screen.queryByText('Allow user to restore messages')).not.toBeInTheDocument();
		});

		it('should toggle/untoggle Backup based on initial state', async () => {
			const mockModifyCos = mock(modifyCos);
			mockModifyCos.mockResolvedValue(defaultModifyCosBody);
			const mockCreateSnackbar = jest.fn();
			(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
			const setCoreAttrs = spySetCoreAttributes();
			const { user } = await renderComponent(<CosAdvanced />);

			await user.click(screen.getByText('Enable / Disable Backup'));
			await user.click(screen.getByText('Save'));

			const expectedBackupEnabledValue = !initialBackupEnabledValue;
			expect(setCoreAttrs).toHaveBeenCalledWith(
				buildAdvancedCosValues(expectedBackupEnabledValue, initialBackupSelfUndeleteAllowedValue)
			);
			expect(mockCreateSnackbar).toHaveBeenCalledWith(successSnackbar);
		});
	});

	describe('COS Forwarding', () => {
		it('should modify the forwarding addresses max length', async () => {
			const mockModifyCos = mock(modifyCos);
			mockModifyCos.mockResolvedValue(defaultModifyCosBody);
			const mockCreateSnackbar = jest.fn();
			(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
			const { user } = await renderComponent(<CosAdvanced />);
			const forwardingAddressesMaxLengthLabel = screen.getByLabelText(
				'Limit user-specified forwarding addresses to (char)'
			) as HTMLInputElement;

			expect(forwardingAddressesMaxLengthLabel).toBeInTheDocument();
			const currentForwardingAddressMaxLength = getCosAttributeValue(
				'zimbraMailForwardingAddressMaxLength'
			);
			expect(forwardingAddressesMaxLengthLabel.value).toBe(currentForwardingAddressMaxLength);

			const newForwardingAddressesMaxLength = '8000';
			await user.clear(forwardingAddressesMaxLengthLabel);
			await user.type(forwardingAddressesMaxLengthLabel, newForwardingAddressesMaxLength);
			await user.click(screen.getByText('Save'));

			expect(mockModifyCos).toHaveBeenCalledWith(
				expectedModifyCosBody(
					'zimbraMailForwardingAddressMaxLength',
					newForwardingAddressesMaxLength
				)
			);
			expect(forwardingAddressesMaxLengthLabel.value).toBe(newForwardingAddressesMaxLength);
			expect(mockCreateSnackbar).toHaveBeenCalledWith(successSnackbar);
		});
	});

	describe('COS Quotas', () => {
		it('should render Quota advanced field', async () => {
			await renderComponent(<CosAdvanced />);

			// This input is shown only if getFileQuotaById returns a limit > 0
			expect(screen.getByLabelText('Files Account quota (GB)')).toBeInTheDocument();
		});

		it('should render Quota default fields', async () => {
			disableAdvanced();
			await renderComponent(<CosAdvanced />);

			expect(screen.getByLabelText('Mails Account quota (GB)')).toBeInTheDocument();
			expect(screen.getByLabelText('Max contacts allowed in the folder')).toBeInTheDocument();
			expect(
				screen.getByLabelText('Percentage threshold for quota warning messages (%)')
			).toBeInTheDocument();
			expect(
				screen.getByLabelText('Minimum duration of time between quota warnings')
			).toBeInTheDocument();
			const timeRangeElements = screen.getAllByText('Time Range');
			timeRangeElements.forEach((element) => {
				expect(element).toBeInTheDocument();
			});
			expect(screen.getByLabelText('Quota warning message template')).toBeInTheDocument();
		});

		it('should modify the mails quota limit', async () => {
			const mockModifyCos = mock(modifyCos);
			mockModifyCos.mockResolvedValue(defaultModifyCosBody);
			const mockCreateSnackbar = jest.fn();
			(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
			const { user } = await renderComponent(<CosAdvanced />);
			const mailsAccountQuotaLabelEl = screen.getByLabelText(
				'Mails Account quota (GB)'
			) as HTMLInputElement;
			expect(mailsAccountQuotaLabelEl.value).toBe('');

			const newMailsAccountQuotaValue = '1.00';
			await user.clear(mailsAccountQuotaLabelEl);
			await user.type(mailsAccountQuotaLabelEl, newMailsAccountQuotaValue);
			await user.click(screen.getByText('Save'));

			expect(mailsAccountQuotaLabelEl.value).toBe(newMailsAccountQuotaValue);
			expect(mockCreateSnackbar).toHaveBeenCalledWith(successSnackbar);
		});
	});

	describe('COS Password', () => {
		it('should enable prevent user from changing password', async () => {
			const mockModifyCos = mock(modifyCos);
			mockModifyCos.mockResolvedValue(defaultModifyCosBody);
			const mockCreateSnackbar = jest.fn();
			(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
			const setCoreAttrs = spySetCoreAttributes();
			const { user } = await renderComponent(<CosAdvanced />);

			expect(screen.getByText('Prevent user from changing password')).toBeInTheDocument();

			await user.click(screen.getByText('Prevent user from changing password'));
			await user.click(screen.getByText('Save'));

			const expectedToggleValue = getCosAttributeValue('zimbraPasswordLocked') === 'FALSE';
			expect(setCoreAttrs).toHaveBeenCalledWith(
				buildAdvancedCosValues(expectedToggleValue, !expectedToggleValue)
			);
			expect(mockCreateSnackbar).toHaveBeenCalledWith(successSnackbar);
		});
	});

	describe('COS Failed Login Policy', () => {
		it('should enable failed login lockout', async () => {
			const mockModifyCos = mock(modifyCos);
			mockModifyCos.mockResolvedValue(defaultModifyCosBody);
			const mockCreateSnackbar = jest.fn();
			(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
			const setCoreAttrs = spySetCoreAttributes();
			const { user } = await renderComponent(<CosAdvanced />);

			expect(screen.getByText('Enable failed login lockout')).toBeInTheDocument();

			await user.click(screen.getByText('Enable failed login lockout'));
			await user.click(screen.getByText('Save'));

			const expectedToggleValue = getCosAttributeValue('zimbraPasswordLockoutEnabled') === 'FALSE';
			expect(setCoreAttrs).toHaveBeenCalledWith(
				buildAdvancedCosValues(expectedToggleValue, !expectedToggleValue)
			);
			expect(mockCreateSnackbar).toHaveBeenCalledWith(successSnackbar);
		});
	});
	describe('COS Timeout Policy', () => {
		it('should modify admin auth token timeout', async () => {
			const mockModifyCos = mock(modifyCos);
			mockModifyCos.mockResolvedValue(defaultModifyCosBody);
			const mockCreateSnackbar = jest.fn();
			(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
			const { user } = await renderComponent(<CosAdvanced />);
			const timeoutPolicyInputLabel = screen.getByLabelText(
				'Admin console auth token lifetime'
			) as HTMLInputElement;

			expect(timeoutPolicyInputLabel).toBeInTheDocument();
			expect(timeoutPolicyInputLabel.value).toBe('');

			const newTimeoutPolicyInputLabel = '800';
			await user.clear(timeoutPolicyInputLabel);
			await user.type(timeoutPolicyInputLabel, newTimeoutPolicyInputLabel);

			const view = screen.getByTestId('zimbraAdminAuthTokenLifetimeType');

			await user.click(within(view).getByText(/seconds/i));
			const dropdown = await screen.findByTestId('dropdown-popper-list');
			await user.click(within(dropdown).getByText(/minutes/i));
			await user.click(screen.getByText('Save'));

			expect(mockModifyCos).toHaveBeenCalledWith(
				expectedModifyCosBody('zimbraAdminAuthTokenLifetime', `${newTimeoutPolicyInputLabel}m`)
			);
			expect(timeoutPolicyInputLabel.value).toBe(newTimeoutPolicyInputLabel);
			expect(mockCreateSnackbar).toHaveBeenCalledWith(successSnackbar);
		});
	});
	describe('COS Email Retention Policy', () => {
		it('should modify admin email retention policy lifetime', async () => {
			const mockModifyCos = mock(modifyCos);
			mockModifyCos.mockResolvedValue(defaultModifyCosBody);
			const mockCreateSnackbar = jest.fn();
			(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);
			const { user } = await renderComponent(<CosAdvanced />);
			const emailRetentionPolicyInputElement = screen.getByRole('textbox', {
				name: 'E-mail message lifetime'
			}) as HTMLInputElement;

			expect(emailRetentionPolicyInputElement).toBeInTheDocument();
			expect(emailRetentionPolicyInputElement).toHaveValue('');

			const newEmailRetentionPolicyInputElement = '800';
			await user.clear(emailRetentionPolicyInputElement);
			await user.type(emailRetentionPolicyInputElement, newEmailRetentionPolicyInputElement);

			const view = screen.getByTestId('zimbraMailTrashLifetimeSelect');

			await user.click(within(view).getByText(/seconds/i));
			const dropdown = await screen.findByTestId('dropdown-popper-list');
			await user.click(within(dropdown).getByText(/minutes/i));
			await user.click(screen.getByText('Save'));

			expect(mockModifyCos).toHaveBeenCalledWith(
				expectedModifyCosBody(
					'zimbraMailMessageLifetime',
					`${newEmailRetentionPolicyInputElement}m`
				)
			);
			expect(emailRetentionPolicyInputElement).toHaveValue(newEmailRetentionPolicyInputElement);
			expect(mockCreateSnackbar).toHaveBeenCalledWith(successSnackbar);
		});
	});
});
