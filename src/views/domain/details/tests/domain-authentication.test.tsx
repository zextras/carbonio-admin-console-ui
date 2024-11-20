/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { act, screen, within } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';

import { Domain } from '../../../../../types';
import { modifyDomain } from '../../../../services/modify-domain-service';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../store/domain/store';
import { setup } from '../../../../tests/testUtils';
import DomainAuthentication from '../domain-authentication';

const createSnackbar = (arg: any): CreateSnackbarFn => arg;
const createSnackbarSpy = jest.fn(createSnackbar);
jest.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

function getDefaultEmptyDomain(): Domain {
	return {
		name: 'demo.zextras.io',
		id: '142f56c1-aaf1-432b-9cfa-448e1b952cf6',
		a: []
	};
}

function getDefaultDomain(
	overrides: {
		zimbraFeatureResetPasswordStatus?: string;
		zimbraAuthLdapStartTlsEnabled?: string;
	} = {}
): Domain {
	const { zimbraFeatureResetPasswordStatus = 'enabled', zimbraAuthLdapStartTlsEnabled = 'TRUE' } =
		overrides;

	return {
		name: 'demo.zextras.io',
		id: '142f56c1-aaf1-432b-9cfa-448e1b952cf6',
		a: [
			{ n: 'zimbraGalAccountId', _content: '5b099ec4-1a40-4b98-ba2b-63525d5fc' },
			{ n: 'carbonioNotificationFrom', _content: 'zextras@demo.zextras.io' },
			{ n: 'zimbraDomainName', _content: 'demo.zextras.io' },
			{ n: 'carbonioSearchSpecifiedDomainsByFeature', _content: 'abc.com' },
			{ n: 'objectClass', _content: 'dcObject' },
			{ n: 'objectClass', _content: 'organization' },
			{ n: 'objectClass', _content: 'zimbraDomain' },
			{ n: 'objectClass', _content: 'amavisAccount' },
			{ n: 'carbonioNotificationRecipients', _content: 'zextras@demo.zextras.io' },
			{ n: 'zimbraMailStatus', _content: 'enabled' },
			{ n: 'o', _content: 'demo.zextras.io domain' },
			{ n: 'zimbraNotes', _content: 'aab' },
			{ n: 'zimbraPublicServiceHostname', _content: 'kc-dev5-u22-ce.demo.zextras.io' },
			{ n: 'zimbraDomainStatus', _content: 'active' },
			{ n: 'zimbraDomainDefaultCOSId', _content: '230fafd4-987b-4d2c-a4ba-fb9bc6b71f97' },
			{ n: 'zimbraId', _content: '142f56c1-aaf1-432b-9cfa-448e1b952cf6' },
			{ n: 'zimbraDomainType', _content: 'local' },
			{ n: 'zimbraCreateTimestamp', _content: '20240718072455.621Z' },
			{ n: 'zimbraAggregateQuotaLastUsage', _content: '905962776' },
			{ n: 'dc', _content: 'demo' },
			{ n: 'zimbraFeatureResetPasswordStatus', _content: zimbraFeatureResetPasswordStatus },
			{ n: 'zimbraAuthLdapStartTlsEnabled', _content: zimbraAuthLdapStartTlsEnabled }
		]
	};
}

jest.mock('../../../../services/modify-domain-service', () => ({
	modifyDomain: jest.fn()
}));

describe('Domain Authentication', () => {
	const setupDomainStore = (): void => {
		useDomainStore.getState().setDomain(getDefaultDomain());
	};

	beforeEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
		setupDomainStore();
		(useSnackbar as jest.Mock).mockReturnValue(createSnackbarSpy);
	});

	describe('Auth Method', () => {
		beforeEach(() => {
			useAuthIsAdvanced.getState().setIsAdvanced(true);
			useDomainStore.getState().setDomain(getDefaultDomain());
		});

		test('renders Auth Method section with valid domain data', () => {
			setup(<DomainAuthentication />);

			expect(screen.getByText('Auth Method')).toBeInTheDocument();

			const authMethodSelect = screen.getByTestId('auth-method-select');
			expect(within(authMethodSelect).getByText('Your Auth Method is')).toBeInTheDocument();
		});

		test('displays Carbonio as default auth method', async () => {
			setup(<DomainAuthentication />);

			const authMethodSelect = screen.getByTestId('auth-method-select');
			expect(await within(authMethodSelect).findByText('Carbonio')).toBeInTheDocument();
		});

		test('displays URL, Filter, Search Bind User, and Password fields', () => {
			setup(<DomainAuthentication />);

			expect(screen.getByRole('textbox', { name: /url/i })).toBeInTheDocument();
			expect(screen.getByRole('textbox', { name: /filter/i })).toBeInTheDocument();
			expect(screen.getByRole('textbox', { name: /search bind user/i })).toBeInTheDocument();
			expect(screen.getByLabelText(/search bind password/i)).toBeInTheDocument();
		});

		test('expands to show additional LDAP/AD options when Carbonio is clicked', async () => {
			const { user } = setup(<DomainAuthentication />);

			const authMethodSelect = screen.getByTestId('auth-method-select');
			const authMethodOptionCarbonio = await within(authMethodSelect).findByText('Carbonio');

			await act(async () => {
				await user.click(authMethodOptionCarbonio);
			});

			expect(screen.getByText(/local ldap only/i)).toBeInTheDocument();
			expect(screen.getByText(/external ldap only/i)).toBeInTheDocument();
			expect(screen.getByText(/external ad only/i)).toBeInTheDocument();
		});

		test('displays save and cancel buttons after modifying fields', async () => {
			const { user } = setup(<DomainAuthentication />);

			const authMethodSelect = screen.getByTestId('auth-method-select');
			const authMethodOptionCarbonio = await within(authMethodSelect).findByText('Carbonio');

			await act(async () => {
				await user.click(authMethodOptionCarbonio);
			});

			const authMethodOptionLocalLdapOnly = await screen.findByText(/local ldap only/i);
			await act(async () => {
				await user.click(authMethodOptionLocalLdapOnly);
			});

			const ldapUrlTextBox = screen.getByRole('textbox', { name: /url/i });
			await act(async () => {
				await user.type(ldapUrlTextBox, 'ldap://localhost:389');
			});

			expect(screen.getByTestId('save-button')).toBeInTheDocument();
			expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
		});

		test('clicking save button calls modifyDomain', async () => {
			const mockModifyDomain = modifyDomain as jest.MockedFunction<typeof modifyDomain>;
			mockModifyDomain.mockResolvedValue({});
			mockModifyDomain.mockResolvedValue({});

			const { user } = setup(<DomainAuthentication />);

			const authMethodSelect = screen.getByTestId('auth-method-select');
			const authMethodOptionCarbonio = await within(authMethodSelect).findByText('Carbonio');

			await act(async () => {
				await user.click(authMethodOptionCarbonio);
			});

			const authMethodOptionLocalLdapOnly = await screen.findByText(/local ldap only/i);
			await act(async () => {
				await user.click(authMethodOptionLocalLdapOnly);
			});

			const ldapUrlTextBox = screen.getByRole('textbox', { name: /url/i });
			await act(async () => {
				await user.type(ldapUrlTextBox, 'ldap://localhost:389');
			});

			await act(async () => {
				await user.click(screen.getByTestId('save-button'));
			});

			expect(mockModifyDomain).toHaveBeenCalledTimes(1);
		});

		test('clicking cancel button hides save and cancel button', async () => {
			const { user } = setup(<DomainAuthentication />);

			const authMethodSelect = screen.getByTestId('auth-method-select');
			const authMethodOptionCarbonio = await within(authMethodSelect).findByText('Carbonio');

			await act(async () => {
				await user.click(authMethodOptionCarbonio);
			});

			const authMethodOptionLocalLdapOnly = await screen.findByText(/local ldap only/i);
			await act(async () => {
				await user.click(authMethodOptionLocalLdapOnly);
			});

			const ldapUrlTextBox = screen.getByRole('textbox', { name: /url/i });
			await act(async () => {
				await user.type(ldapUrlTextBox, 'ldap://localhost:389');
			});

			await act(async () => {
				await user.click(screen.getByTestId('cancel-button'));
			});

			expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
			expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
		});
	});

	describe('Verify Auth: Toggle switches', () => {
		beforeEach(() => {
			useAuthIsAdvanced.getState().setIsAdvanced(true);
		});

		const resetPasswordTests = [
			{ test: 'turned on', status: 'enabled', expectedIcon: 'icon: ToggleRight' },
			{ test: 'turned off', status: 'disabled', expectedIcon: 'icon: ToggleLeftOutline' },
			{ test: 'turned off', status: 'suspended', expectedIcon: 'icon: ToggleLeftOutline' },
			{ test: 'turned off', status: undefined, expectedIcon: 'icon: ToggleLeftOutline' }
		];

		test.each(resetPasswordTests)(
			'reset password switch must be $test when zimbraFeatureResetPasswordStatus is $status',
			({ status, expectedIcon }) => {
				useDomainStore
					.getState()
					.setDomain(
						status === undefined
							? getDefaultEmptyDomain()
							: getDefaultDomain({ zimbraFeatureResetPasswordStatus: status })
					);

				setup(<DomainAuthentication />);
				expect(screen.getByText('Verify Auth')).toBeInTheDocument();

				const forgotPasswordSwitch = screen.getByTestId('reset-password-switch');
				expect(within(forgotPasswordSwitch).getByTestId(expectedIcon)).toBeInTheDocument();
			}
		);

		const secureConnectionTests = [
			{ test: 'turned on', enabled: 'TRUE', expectedIcon: 'icon: ToggleRight' },
			{ test: 'turned off', enabled: 'FALSE', expectedIcon: 'icon: ToggleLeftOutline' },
			{ test: 'turned off', enabled: undefined, expectedIcon: 'icon: ToggleLeftOutline' }
		];

		test.each(secureConnectionTests)(
			'enable secure connection switch must be turned $test when zimbraAuthLdapStartTlsEnabled is $enabled',
			({ enabled, expectedIcon }) => {
				useDomainStore
					.getState()
					.setDomain(
						enabled === undefined
							? getDefaultEmptyDomain()
							: getDefaultDomain({ zimbraAuthLdapStartTlsEnabled: enabled })
					);

				setup(<DomainAuthentication />);
				expect(screen.getByText('Verify Auth')).toBeInTheDocument();

				const enableSecureConnection = screen.getByTestId('enable-secure-connection');
				expect(within(enableSecureConnection).getByTestId(expectedIcon)).toBeInTheDocument();
			}
		);

		const toggleSwitchTests = [
			{
				description: 'zimbraFeatureResetPasswordStatus switch is toggled',
				initialState: { zimbraFeatureResetPasswordStatus: 'enabled' },
				switchTestId: 'reset-password-switch',
				initialIcon: 'icon: ToggleRight',
				toggledIcon: 'icon: ToggleLeftOutline'
			},
			{
				description: 'zimbraAuthLdapStartTlsEnabled switch is toggled',
				initialState: { zimbraAuthLdapStartTlsEnabled: 'TRUE' },
				switchTestId: 'enable-secure-connection',
				initialIcon: 'icon: ToggleRight',
				toggledIcon: 'icon: ToggleLeftOutline'
			}
		];

		test.each(toggleSwitchTests)(
			'should show cancel/save buttons when $description',
			async ({ initialState, switchTestId, initialIcon, toggledIcon }) => {
				useAuthIsAdvanced.getState().setIsAdvanced(true);
				useDomainStore.getState().setDomain(getDefaultDomain(initialState));

				const { user } = setup(<DomainAuthentication />);
				expect(screen.getByText('Verify Auth')).toBeInTheDocument();

				const toggleSwitch = screen.getByTestId(switchTestId);
				expect(within(toggleSwitch).getByTestId(initialIcon)).toBeInTheDocument();
				expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
				expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();

				await act(async () => {
					await user.click(toggleSwitch);
				});
				expect(within(toggleSwitch).getByTestId(toggledIcon)).toBeInTheDocument();
				expect(screen.getByTestId('save-button')).toBeVisible();
				expect(screen.getByTestId('cancel-button')).toBeVisible();
			}
		);
	});
});
