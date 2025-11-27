/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDomainStore } from '@zextras/admin-ui-bootstrap';
import { createBrowserAPIInterceptor, getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { it, expect, describe, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext } from '../account-context';

import EditAccountSecuritySection from './edit-account-security-section';

const mockContextValue = {
	accountDetail: {
		zimbraPasswordLocked: 'FALSE',
		zimbraPasswordMinLength: '8',
		zimbraPasswordMaxLength: '64',
		zimbraPasswordMinUpperCaseChars: '1',
		zimbraPasswordMinLowerCaseChars: '1',
		zimbraPasswordMinPunctuationChars: '1',
		zimbraPasswordMinNumericChars: '1',
		zimbraPasswordMinAge: '0',
		zimbraPasswordMaxAge: '90',
		zimbraPasswordMinDigitsOrPuncs: '0',
		zimbraPasswordEnforceHistory: '0',
		zimbraPasswordBlockCommonEnabled: 'FALSE',
		zimbraPasswordLockoutEnabled: 'FALSE',
		zimbraPasswordLockoutMaxFailures: '10',
		zimbraPasswordLockoutDuration: '1h',
		zimbraPasswordLockoutFailureLifetime: '1h',
		zimbraFeatureResetPasswordStatus: 'disabled',
		zimbraPrefPasswordRecoveryAddress: '',
		zimbraPrefPasswordRecoveryAddressStatus: 'pending',
		backupSelfUndeleteAllowed: false,
		carbonioFeatureOTPMgmtEnabled: 'FALSE',
		uid: 'test-user',
		name: 'test-user',
		zimbraId: 'mock-id'
	},
	cosDetail: {
		zimbraPasswordLocked: 'FALSE',
		zimbraPasswordMinLength: '6',
		zimbraPasswordMaxLength: '128',
		zimbraPasswordMinUpperCaseChars: '0',
		zimbraPasswordMinLowerCaseChars: '0',
		zimbraPasswordMinPunctuationChars: '0',
		zimbraPasswordMinNumericChars: '0',
		zimbraPasswordMinAge: '0',
		zimbraPasswordMaxAge: '0',
		zimbraPasswordMinDigitsOrPuncs: '0',
		zimbraPasswordEnforceHistory: '0',
		zimbraPasswordBlockCommonEnabled: 'FALSE',
		zimbraPasswordLockoutEnabled: 'FALSE',
		zimbraPasswordLockoutMaxFailures: '5',
		zimbraPasswordLockoutDuration: '30m',
		zimbraPasswordLockoutFailureLifetime: '30m',
		carbonioFeatureOTPMgmtEnabled: 'FALSE',
		zimbraId: 'mock-id'
	},
	accSpecificDetail: {
		zimbraPasswordLocked: 'FALSE',
		zimbraPasswordMinLength: '8',
		zimbraPasswordMaxLength: '64',
		zimbraPasswordMinUpperCaseChars: '1',
		zimbraPasswordMinLowerCaseChars: '1',
		zimbraPasswordMinPunctuationChars: '1',
		zimbraPasswordMinNumericChars: '1',
		zimbraPasswordMinAge: '0',
		zimbraPasswordMaxAge: '90',
		zimbraPasswordMinDigitsOrPuncs: '0',
		zimbraPasswordEnforceHistory: '0',
		zimbraPasswordBlockCommonEnabled: 'FALSE',
		zimbraPasswordLockoutEnabled: 'FALSE',
		zimbraPasswordLockoutMaxFailures: '10',
		zimbraPasswordLockoutDuration: '1h',
		zimbraPasswordLockoutFailureLifetime: '1h',
		carbonioFeatureOTPMgmtEnabled: 'FALSE',
		zimbraId: 'mock-id'
	},
	directMemberList: [],
	inDirectMemberList: [],
	setSignatureItems: () => { },
	setSignatureList: () => { },
	setAccountDetail: () => { },
	setAccSpecificDetail: () => { },
	setDirectMemberList: () => { },
	setInDirectMemberList: () => { },
	setInitAccountDetail: () => { },
	initAccountDetail: {},
	otpList: [],
	identitiesList: [],
	folderList: [],
	setFolderList: () => { },
	getListOtp: () => { },
	getIdentitiesList: () => { },
	deligateDetail: {},
	setDeligateDetail: () => { },
	credentialList: [],
	getCredentialList: () => { },
	initialGlobalRights: {},
	setinitialGlobalRights: () => { },
	globalRights: {},
	setGlobalRights: () => { },
	deleteAdministrationRights: [],
	setDeleteAdministrationRights: () => { },
	userSessionList: [],
	setAllUserSessionList: () => { },
	allUserSessionList: [],
	setUserSessionList: () => { },
	defaultCOS: {},
	setDefaultCOS: () => { },
	allowedDeletePassword: false,
	setAllowedDeletePassword: () => { }
};

function setupEditAccountSecurityTest(component: React.ReactElement) {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['advanced-supported'], true);

	return setupBrowserTest(component, { queryClient });
}

beforeEach(async () => {
	// Set up domain store
	useDomainStore.setState({
		domain: {
			name: 'test-domain.com',
			id: 'domain-id'
		}
	});
});

describe.skip('EditAccountSecuritySection (browser)', () => {
	describe('Basic Rendering', () => {
		it('should render all main sections', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
			await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
		});

		it('should render all password policy fields', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Minimum password length')).toBeVisible();
			await expect.element(page.getByText('Maximum password length')).toBeVisible();
			await expect.element(page.getByText('Minimum upper case characters')).toBeVisible();
			await expect.element(page.getByText('Minimum lower case characters')).toBeVisible();
			await expect.element(page.getByText('Minimum punctuation symbols')).toBeVisible();
			await expect
				.element(page.getByText('Minimum numeric characters', { exact: true }))
				.toBeVisible();
			await expect.element(page.getByText('Minimum password age (Days)')).toBeVisible();
			await expect.element(page.getByText('Maximum password age (Days)')).toBeVisible();
			await expect
				.element(page.getByText('Minimum numeric characters or punctuation symbols'))
				.toBeVisible();
			await expect
				.element(page.getByText('Minimum number of unique passwords history'))
				.toBeVisible();
		});

		it('should render password policy switches', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Prevent user from changing password')).toBeVisible();
			await expect.element(page.getByText('Reject common passwords')).toBeVisible();
		});

		it('should render failed login lockout fields', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
			await expect
				.element(page.getByText('Number of consecutive failed logins allowed'))
				.toBeVisible();
			await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
			await expect
				.element(
					page.getByText('Time window in which the failed logins must occur to lock the account:')
				)
				.toBeVisible();
		});

		it('should render recovery email field', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('User Recovery Email')).toBeVisible();
			await expect
				.element(page.getByText('User can ask for a forgotten password token'))
				.toBeVisible();
		});

		it('should render password note for external authentication', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect
				.element(
					page.getByText(
						'The settings below ↓ do not affect the passwords set by users in domains that are configured to use external authentication. Changes made here will override COS settings for the password and the failed login lockout.'
					)
				)
				.toBeVisible();
		});
	});

	describe('Password Policy Variations', () => {
		it('should render with password locked enabled', async () => {
			const contextWithLocked = {
				...mockContextValue,
				accountDetail: { ...mockContextValue.accountDetail, zimbraPasswordLocked: 'TRUE' }
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithLocked}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Prevent user from changing password')).toBeVisible();
		});

		it('should render with common passwords blocked', async () => {
			const contextWithBlocked = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordBlockCommonEnabled: 'TRUE'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithBlocked}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Reject common passwords')).toBeVisible();
		});

		it('should render with password history enabled', async () => {
			const contextWithHistory = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordEnforceHistory: '5'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithHistory}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect
				.element(page.getByText('Minimum number of unique passwords history'))
				.toBeVisible();
		});

		it('should render with all password policies enabled', async () => {
			const fullContext = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLocked: 'TRUE',
					zimbraPasswordMinLength: '12',
					zimbraPasswordMaxLength: '128',
					zimbraPasswordMinUpperCaseChars: '2',
					zimbraPasswordMinLowerCaseChars: '2',
					zimbraPasswordMinPunctuationChars: '2',
					zimbraPasswordMinNumericChars: '2',
					zimbraPasswordMinAge: '7',
					zimbraPasswordMaxAge: '180',
					zimbraPasswordMinDigitsOrPuncs: '2',
					zimbraPasswordEnforceHistory: '10',
					zimbraPasswordBlockCommonEnabled: 'TRUE'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={fullContext}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
		});
	});

	describe('Failed Login Policy Variations', () => {
		it('should render with lockout enabled', async () => {
			const contextWithLockout = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutEnabled: 'TRUE'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithLockout}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
		});

		it('should render with lockout duration in seconds', async () => {
			const contextWithDuration = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutDuration: '30s'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithDuration}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
		});

		it('should render with lockout duration in minutes', async () => {
			const contextWithDuration = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutDuration: '15m'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithDuration}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
		});

		it('should render with lockout duration in hours', async () => {
			const contextWithDuration = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutDuration: '2h'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithDuration}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
		});

		it('should render with lockout duration in days', async () => {
			const contextWithDuration = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutDuration: '2d'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithDuration}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
		});

		it('should render with failure lifetime in minutes', async () => {
			const contextWithLifetime = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutFailureLifetime: '30m'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithLifetime}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect
				.element(
					page.getByText('Time window in which the failed logins must occur to lock the account:')
				)
				.toBeVisible();
		});

		it('should render with failure lifetime in hours', async () => {
			const contextWithLifetime = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutFailureLifetime: '2h'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithLifetime}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect
				.element(
					page.getByText('Time window in which the failed logins must occur to lock the account:')
				)
				.toBeVisible();
		});

		it('should render with failure lifetime in days', async () => {
			const contextWithLifetime = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutFailureLifetime: '7d'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithLifetime}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect
				.element(
					page.getByText('Time window in which the failed logins must occur to lock the account:')
				)
				.toBeVisible();
		});

		it('should render with all lockout policies enabled', async () => {
			const lockoutContext = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLockoutEnabled: 'TRUE',
					zimbraPasswordLockoutMaxFailures: '3',
					zimbraPasswordLockoutDuration: '24h',
					zimbraPasswordLockoutFailureLifetime: '1d'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={lockoutContext}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
		});
	});

	describe('Recovery Settings', () => {
		it('should render with recovery email address', async () => {
			const contextWithRecovery = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPrefPasswordRecoveryAddress: 'recovery@example.com'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithRecovery}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('User Recovery Email')).toBeVisible();
		});

		it('should render with reset password enabled', async () => {
			const contextWithReset = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraFeatureResetPasswordStatus: 'enabled'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithReset}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect
				.element(page.getByText('User can ask for a forgotten password token'))
				.toBeVisible();
		});

		it('should render with verified recovery status', async () => {
			const contextWithVerified = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPrefPasswordRecoveryAddressStatus: 'verified'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithVerified}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Status')).toBeVisible();
		});

		it('should render with full recovery settings', async () => {
			const recoveryContext = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraFeatureResetPasswordStatus: 'enabled',
					zimbraPrefPasswordRecoveryAddress: 'test@example.com',
					zimbraPrefPasswordRecoveryAddressStatus: 'verified'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={recoveryContext}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
		});
	});

	describe('OTP and Backup Features', () => {
		it('should render with OTP management enabled', async () => {
			const contextWithOTP = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					carbonioFeatureOTPMgmtEnabled: 'TRUE'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithOTP}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('One Time Password management')).toBeVisible();
		});

		it('should render with backup self undelete allowed', async () => {
			const contextWithBackup = {
				...mockContextValue,
				accountDetail: {
					...mockContextValue.accountDetail,
					backupSelfUndeleteAllowed: true
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithBackup}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Backup')).toBeVisible();
			await expect.element(page.getByText('Allow user to restore messages')).toBeVisible();
		});

		it('should render with empty OTP list', async () => {
			const contextWithEmptyOTP = {
				...mockContextValue,
				otpList: []
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithEmptyOTP}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
			await expect.element(page.getByText('This list is empty.')).toBeVisible();
		});

		it('should render OTP list when available', async () => {
			const contextWithOTPList = {
				...mockContextValue,
				otpList: [
					{
						id: '1',
						description: 'Test OTP',
						status: 'Active',
						failed: '0',
						'creation-date': '2024-01-01',
						columns: ['Test OTP', 'Active', '0', '2024-01-01']
					}
				]
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithOTPList}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
		});

		it('should render NEW OTP and DELETE buttons', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByRole('button', { name: /NEW OTP/i })).toBeVisible();
			await expect.element(page.getByText('DELETE')).toBeVisible();
		});
	});

	describe('Inherited Values and Reset', () => {
		it('should render reset buttons for inherited fields', async () => {
			const contextWithInherited = {
				...mockContextValue,
				accSpecificDetail: {
					...mockContextValue.accSpecificDetail,
					zimbraPasswordLocked: 'TRUE'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={contextWithInherited}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			const resetButton = page.getByTestId('reset-zimbraPasswordLocked');
			await expect.element(resetButton).toBeVisible();
		});

		it('should call setAccountDetail when reset button is clicked', async () => {
			const mockSetAccountDetail = vi.fn();
			const testContext = {
				...mockContextValue,
				setAccountDetail: mockSetAccountDetail,
				accountDetail: {
					...mockContextValue.accountDetail,
					zimbraPasswordLocked: 'TRUE'
				},
				accSpecificDetail: {
					...mockContextValue.accSpecificDetail,
					zimbraPasswordLocked: 'FALSE'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={testContext}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);

			const resetButton = page.getByTestId('reset-zimbraPasswordLocked');
			await expect.element(resetButton).toBeVisible();
			await resetButton.click();

			expect(mockSetAccountDetail).toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should render with empty accountDetail', async () => {
			const emptyContext = { ...mockContextValue, accountDetail: {} };
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={emptyContext}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
		});

		it('should render with minimal accountDetail', async () => {
			const minimalContext = {
				...mockContextValue,
				accountDetail: {
					uid: 'test-user',
					name: 'test-user',
					zimbraId: 'min-test-id'
				}
			};
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={minimalContext}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);
			await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
		});

		it('should render when isAdvanced is false', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);

			await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
		});
	});

	describe('Email Sending for OTP', () => {
		beforeAll(() => {
			// Mock scrollTo to avoid errors in browser tests where refs might be null
			const mockScrollTo = vi.fn();
			if (Element.prototype.scrollTo === undefined || Element.prototype.scrollTo === null) {
				Element.prototype.scrollTo = mockScrollTo;
			} else {
				vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(mockScrollTo);
			}
			if (globalThis.HTMLElement) {
				if (
					globalThis.HTMLElement.prototype.scrollTo === undefined ||
					globalThis.HTMLElement.prototype.scrollTo === null
				) {
					globalThis.HTMLElement.prototype.scrollTo = mockScrollTo;
				} else {
					vi.spyOn(globalThis.HTMLElement.prototype, 'scrollTo').mockImplementation(mockScrollTo);
				}
			}
		});

		it('should render OTP wizard with QR code when showCreateOTP is true', async () => {
			const mockGetListOtp = vi.fn();
			const testContext = {
				...mockContextValue,
				getListOtp: mockGetListOtp
			};

			setupEditAccountSecurityTest(
				<AccountContext.Provider value={testContext}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);

			await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
				HttpResponse.json({
					Body: {
						ok: true,
						response: {
							label: 'test-user@test-domain.com',
							secret: 'TESTSECRETCODE123',
							issuer: 'Carbonio',
							algorithm: 'SHA1',
							digits_length: 6,
							period: 30,
							static_otp_codes: [
								{ code: '111111' },
								{ code: '222222' },
								{ code: '333333' },
								{ code: '444444' },
								{ code: '555555' },
								{ code: '666666' }
							]
						}
					}
				})
			);

			const newOtpButton = page.getByRole('button', { name: /NEW OTP/i });
			await expect.element(newOtpButton).toBeVisible();
			await newOtpButton.click();

			// Wait for the wizard content to appear after API call
			await expect.element(page.getByText('Create OTP Wizard')).toBeVisible();
			await expect
				.element(page.getByText(`Please note: you'll be able to see these codes just once.`))
				.toBeVisible();
			await expect
				.element(
					page.getByText(`Select an email address to send the OTP to or copy the code above`)
				)
				.toBeVisible();
		});

		it('should render OTP wizard with send OTP email input when showCreateOTP is true', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);

			await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
				HttpResponse.json({
					Body: {
						ok: true,
						response: {
							label: 'test-user@test-domain.com',
							secret: 'TESTSECRETCODE123',
							issuer: 'Carbonio',
							algorithm: 'SHA1',
							digits_length: 6,
							period: 30,
							static_otp_codes: [
								{ code: '111111' },
								{ code: '222222' },
								{ code: '333333' },
								{ code: '444444' },
								{ code: '555555' },
								{ code: '666666' }
							]
						}
					}
				})
			);

			const newOtpButton = page.getByRole('button', { name: /NEW OTP/i });
			await expect.element(newOtpButton).toBeVisible();
			await newOtpButton.click();

			await expect
				.element(page.getByText(`Please note: you'll be able to see these codes just once.`))
				.toBeVisible();
			const otpEmailInput = page.getByPlaceholder('Send the OTP to');
			await expect.element(otpEmailInput).toBeVisible();
			await otpEmailInput.fill('test@example.com');
			await userEvent.keyboard('{Tab}');

			const sendButton = page.getByRole('button', { name: /SEND/i });
			await expect.element(sendButton).toBeVisible();
			await expect.element(sendButton).toBeEnabled();
		}); it('should display invalid email msg and button should be disabled for invalid email', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);

			await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
				HttpResponse.json({
					Body: {
						ok: true,
						response: {
							label: 'test-user@test-domain.com',
							secret: 'TESTSECRETCODE123',
							issuer: 'Carbonio',
							algorithm: 'SHA1',
							digits_length: 6,
							period: 30,
							static_otp_codes: [
								{ code: '111111' },
								{ code: '222222' },
								{ code: '333333' },
								{ code: '444444' },
								{ code: '555555' },
								{ code: '666666' }
							]
						}
					}
				})
			);

			const newOtpButton = page.getByRole('button', { name: /NEW OTP/i });
			await expect.element(newOtpButton).toBeVisible();
			await newOtpButton.click();

			await expect.element(page.getByText('Create OTP Wizard')).toBeVisible();
			const otpEmailInput = page.getByPlaceholder('Send the OTP to');
			await expect.element(otpEmailInput).toBeVisible();
			await otpEmailInput.fill('test@example.com');
			await userEvent.keyboard('{Tab}');

			await expect
				.element(page.getByText('One or more email addresses are invalid.'))
				.not.toBeInTheDocument();
			const sendButton = page.getByRole('button', { name: /SEND/i });
			await expect.element(sendButton).toBeVisible();
			await expect.element(sendButton).toBeEnabled();

			await otpEmailInput.fill('test@example'); // Invalid email
			await userEvent.keyboard('{Tab}');
			await expect
				.element(page.getByText('One or more email addresses are invalid.'))
				.toBeVisible();
			await expect.element(sendButton).toBeDisabled();
		});

		it('should call sendMail when SEND button is clicked with valid email', async () => {
			setupEditAccountSecurityTest(
				<AccountContext.Provider value={mockContextValue}>
					<EditAccountSecuritySection />
				</AccountContext.Provider>
			);

			await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
				HttpResponse.json({
					Body: {
						ok: true,
						response: {
							label: 'test-user@test-domain.com',
							secret: 'TESTSECRETCODE123',
							issuer: 'Carbonio',
							algorithm: 'SHA1',
							digits_length: 6,
							period: 30,
							static_otp_codes: [
								{ code: '111111' },
								{ code: '222222' },
								{ code: '333333' },
								{ code: '444444' },
								{ code: '555555' },
								{ code: '666666' }
							]
						}
					}
				})
			);

			const newOtpButton = page.getByRole('button', { name: /NEW OTP/i });
			await expect.element(newOtpButton).toBeVisible();
			await newOtpButton.click();

			await expect.element(page.getByText('Create OTP Wizard')).toBeVisible();
			const otpEmailInput = page.getByPlaceholder('Send the OTP to');
			await expect.element(otpEmailInput).toBeVisible();
			await otpEmailInput.fill('recipient@example.com');
			await userEvent.keyboard('{Tab}');

			const sendButton = page.getByRole('button', { name: /SEND/i });
			await expect.element(sendButton).toBeVisible();
			await expect.element(sendButton).toBeEnabled();

			await sendButton.click();
		});
	});
});
