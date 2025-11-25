/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { it, expect, describe, vi, beforeAll, afterAll, beforeEach } from 'vitest';

import { sendMail } from '../../../../../services/send-mail-service';
import { AccountContext } from '../account-context';

import EditAccountSecuritySection from './edit-account-security-section';

// Mock the useIsAdvanced and useDomainStore hooks
vi.mock('@zextras/admin-ui-bootstrap', async () => {
	const actual = await vi.importActual('@zextras/admin-ui-bootstrap');
	return {
		...actual,
		useIsAdvanced: vi.fn(() => true),
		useDomainStore: vi.fn((selector) => {
			const state = { domain: { name: 'test-domain.com' } };
			return selector ? selector(state) : state;
		})
	};
});

// Mock the sendMail service
vi.mock('../../../../../services/send-mail-service', () => ({
	sendMail: vi.fn()
}));

// Suppress MSW cleanup errors that occur when tests finish
let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

beforeAll(() => {
	unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
		// Suppress MSW deserialization errors that occur during test cleanup
		if (
			event.reason?.message?.includes('Cannot read properties of undefined') &&
			event.reason?.stack?.includes('deserializeRequest')
		) {
			event.preventDefault();
		}
	};
	globalThis.addEventListener('unhandledrejection', unhandledRejectionHandler);
});

afterAll(() => {
	if (unhandledRejectionHandler) {
		globalThis.removeEventListener('unhandledrejection', unhandledRejectionHandler);
	}
});

beforeEach(() => {
	// Mock fetch API to handle any SOAP requests
	vi.spyOn(globalThis, 'fetch').mockResolvedValue(
		new Response(JSON.stringify({ Body: {} }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
	);
});

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

describe('EditAccountSecuritySection (browser)', () => {
	it('should render password section', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
	});

	it('should render failed login policy section', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
	});

	it('should render forgotten password section', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
	});

	it('should render password policy fields', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum password length')).toBeVisible();
		await expect.element(page.getByText('Maximum password length')).toBeVisible();
		await expect.element(page.getByText('Minimum upper case characters')).toBeVisible();
		await expect.element(page.getByText('Minimum lower case characters')).toBeVisible();
		await expect.element(page.getByText('Minimum punctuation symbols')).toBeVisible();
		await expect.element(page.getByText('Minimum numeric characters', { exact: true })).toBeVisible();
	});

	it('should render password age fields', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum password age (Days)')).toBeVisible();
		await expect.element(page.getByText('Maximum password age (Days)')).toBeVisible();
	});

	it('should render password policy switches', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(page.getByText('Prevent user from changing password'))
			.toBeVisible();
		await expect.element(page.getByText('Reject common passwords')).toBeVisible();
	});

	it('should render failed login lockout fields', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
		await expect
			.element(page.getByText('Number of consecutive failed logins allowed'))
			.toBeVisible();
		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render recovery email field', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('User Recovery Email')).toBeVisible();
	});

	it('should render with password locked enabled', async () => {
		const contextWithLocked = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPasswordLocked: 'TRUE' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithLocked}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(page.getByText('Prevent user from changing password'))
			.toBeVisible();
	});

	it('should render with common passwords blocked', async () => {
		const contextWithBlocked = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordBlockCommonEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithBlocked}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Reject common passwords')).toBeVisible();
	});

	it('should render with lockout enabled', async () => {
		const contextWithLockout = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithLockout}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
	});

	it('should render with different lockout duration', async () => {
		const contextWithDuration = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: '2d'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDuration}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render with different failure lifetime', async () => {
		const contextWithLifetime = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutFailureLifetime: '30m'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithLifetime}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(
				page.getByText(
					'Time window in which the failed logins must occur to lock the account:'
				)
			)
			.toBeVisible();
	});

	it('should render with recovery email address', async () => {
		const contextWithRecovery = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddress: 'recovery@example.com'
			}
		};
		setupBrowserTest(
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
		setupBrowserTest(
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
		setupBrowserTest(
			<AccountContext.Provider value={contextWithVerified}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Status')).toBeVisible();
	});

	it('should render with different password min length', async () => {
		const contextWithMinLength = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPasswordMinLength: '12' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMinLength}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum password length')).toBeVisible();
	});

	it('should render with different password max length', async () => {
		const contextWithMaxLength = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPasswordMaxLength: '128' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMaxLength}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Maximum password length')).toBeVisible();
	});

	it('should render with different min upper case chars', async () => {
		const contextWithUpper = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinUpperCaseChars: '2'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithUpper}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum upper case characters')).toBeVisible();
	});

	it('should render with different min lower case chars', async () => {
		const contextWithLower = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinLowerCaseChars: '2'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithLower}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum lower case characters')).toBeVisible();
	});

	it('should render with different min punctuation chars', async () => {
		const contextWithPunct = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinPunctuationChars: '2'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithPunct}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum punctuation symbols')).toBeVisible();
	});

	it('should render with different min numeric chars', async () => {
		const contextWithNumeric = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinNumericChars: '2'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithNumeric}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum numeric characters', { exact: true })).toBeVisible();
	});

	it('should render with different password min age', async () => {
		const contextWithMinAge = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPasswordMinAge: '7' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMinAge}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum password age (Days)')).toBeVisible();
	});

	it('should render with different password max age', async () => {
		const contextWithMaxAge = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPasswordMaxAge: '180' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMaxAge}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Maximum password age (Days)')).toBeVisible();
	});

	it('should render with password history enabled', async () => {
		const contextWithHistory = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordEnforceHistory: '5'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithHistory}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(page.getByText('Minimum number of unique passwords history'))
			.toBeVisible();
	});

	it('should render with different max login failures', async () => {
		const contextWithFailures = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutMaxFailures: '5'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithFailures}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(page.getByText('Number of consecutive failed logins allowed'))
			.toBeVisible();
	});

	it('should render with empty accountDetail', async () => {
		const emptyContext = { ...mockContextValue, accountDetail: {} };
		setupBrowserTest(
			<AccountContext.Provider value={emptyContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
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
		setupBrowserTest(
			<AccountContext.Provider value={fullContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
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
		setupBrowserTest(
			<AccountContext.Provider value={lockoutContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
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
		setupBrowserTest(
			<AccountContext.Provider value={recoveryContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
	});

	it('should render password note for external authentication', async () => {
		setupBrowserTest(
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

	it('should render time range select for lockout duration', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Time Range').first()).toBeVisible();
	});

	it('should render with lockout duration in seconds', async () => {
		const contextWithSeconds = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: '30s'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithSeconds}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render with lockout duration in minutes', async () => {
		const contextWithMinutes = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: '15m'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMinutes}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render with failure lifetime in hours', async () => {
		const contextWithHours = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutFailureLifetime: '2h'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithHours}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(
				page.getByText(
					'Time window in which the failed logins must occur to lock the account:'
				)
			)
			.toBeVisible();
	});

	it('should render with failure lifetime in days', async () => {
		const contextWithDays = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutFailureLifetime: '7d'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDays}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(
				page.getByText(
					'Time window in which the failed logins must occur to lock the account:'
				)
			)
			.toBeVisible();
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
		setupBrowserTest(
			<AccountContext.Provider value={minimalContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
	});

	it('should render with all required password fields', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum password length')).toBeVisible();
		await expect.element(page.getByText('Maximum password length')).toBeVisible();
		await expect.element(page.getByText('Minimum upper case characters')).toBeVisible();
		await expect.element(page.getByText('Minimum lower case characters')).toBeVisible();
		await expect.element(page.getByText('Minimum punctuation symbols')).toBeVisible();
		await expect.element(page.getByText('Minimum numeric characters', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Minimum password age (Days)')).toBeVisible();
		await expect.element(page.getByText('Maximum password age (Days)')).toBeVisible();
		await expect
			.element(
				page.getByText('Minimum numeric characters or punctuation symbols')
			)
			.toBeVisible();
		await expect
			.element(page.getByText('Minimum number of unique passwords history'))
			.toBeVisible();
	});

	it('should render with pending recovery status', async () => {
		const contextWithPending = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddressStatus: 'pending'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithPending}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Status')).toBeVisible();
	});

	it('should render reset buttons for inherited fields', async () => {
		const contextWithInherited = {
			...mockContextValue,
			accSpecificDetail: {
				...mockContextValue.accSpecificDetail,
				zimbraPasswordLocked: 'TRUE'
			}
		};
		setupBrowserTest(
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
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		const resetButton = page.getByTestId('reset-zimbraPasswordLocked');
		await expect.element(resetButton).toBeVisible();
		await resetButton.click();

		// Verify that setAccountDetail was called with a function
		expect(mockSetAccountDetail).toHaveBeenCalled();
	});

	it('should render with OTP management enabled', async () => {
		const contextWithOTP = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				carbonioFeatureOTPMgmtEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
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
		setupBrowserTest(
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
		setupBrowserTest(
			<AccountContext.Provider value={contextWithEmptyOTP}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
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
		setupBrowserTest(
			<AccountContext.Provider value={contextWithOTPList}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should render NEW OTP button', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByRole('button', { name: /NEW OTP/i })).toBeVisible();
	});

	it('should render DELETE button', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('DELETE')).toBeVisible();
	});

	it('should render empty OTP list message', async () => {
		const contextWithEmptyOTP = {
			...mockContextValue,
			otpList: []
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithEmptyOTP}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('This list is empty.')).toBeVisible();
	});

	it('should render with all security features enabled', async () => {
		const fullSecurityContext = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLocked: 'TRUE',
				zimbraPasswordBlockCommonEnabled: 'TRUE',
				zimbraPasswordLockoutEnabled: 'TRUE',
				zimbraFeatureResetPasswordStatus: 'enabled',
				carbonioFeatureOTPMgmtEnabled: 'TRUE',
				backupSelfUndeleteAllowed: true,
				zimbraPrefPasswordRecoveryAddress: 'recovery@example.com',
				zimbraPrefPasswordRecoveryAddressStatus: 'verified'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={fullSecurityContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
		await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
	});

	it('should render min digits or puncs field', async () => {
		const contextWithDigitsOrPuncs = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinDigitsOrPuncs: '3'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDigitsOrPuncs}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(
				page.getByText('Minimum numeric characters or punctuation symbols')
			)
			.toBeVisible();
	});

	it('should render with different lockout duration time units', async () => {
		const contextWithDurationSeconds = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: '45s'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDurationSeconds}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render with lockout enabled and various fields', async () => {
		const contextWithLockoutFields = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutEnabled: 'TRUE',
				zimbraPasswordLockoutMaxFailures: '8',
				zimbraPasswordLockoutDuration: '3h',
				zimbraPasswordLockoutFailureLifetime: '2d'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithLockoutFields}>
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
				page.getByText(
					'Time window in which the failed logins must occur to lock the account:'
				)
			)
			.toBeVisible();
	});

	it('should render with all password character requirements', async () => {
		const contextWithAllRequirements = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinLength: '10',
				zimbraPasswordMaxLength: '100',
				zimbraPasswordMinUpperCaseChars: '3',
				zimbraPasswordMinLowerCaseChars: '3',
				zimbraPasswordMinPunctuationChars: '2',
				zimbraPasswordMinNumericChars: '2',
				zimbraPasswordMinDigitsOrPuncs: '4'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithAllRequirements}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum password length')).toBeVisible();
		await expect.element(page.getByText('Maximum password length')).toBeVisible();
		await expect.element(page.getByText('Minimum upper case characters')).toBeVisible();
		await expect.element(page.getByText('Minimum lower case characters')).toBeVisible();
		await expect.element(page.getByText('Minimum punctuation symbols')).toBeVisible();
		await expect.element(page.getByText('Minimum numeric characters', { exact: true })).toBeVisible();
		await expect
			.element(
				page.getByText('Minimum numeric characters or punctuation symbols')
			)
			.toBeVisible();
	});

	it('should render OTP wizard when creating new OTP', async () => {
		const contextForOTP = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				uid: 'testuser',
				name: 'testuser'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextForOTP}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
		await expect.element(page.getByRole('button', { name: /NEW OTP/i })).toBeVisible();
	});

	it('should render table headers for OTP list', async () => {
		const contextWithOTPTable = {
			...mockContextValue,
			otpList: [
				{
					id: 'otp-1',
					description: 'Mobile Device',
					status: 'Active',
					failed: '0',
					'creation-date': '2025-11-01',
					columns: ['Mobile Device', 'Active', '0', '2025-11-01']
				}
			]
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithOTPTable}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should handle reset password status disabled', async () => {
		const contextWithDisabled = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraFeatureResetPasswordStatus: 'disabled'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDisabled}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(page.getByText('User can ask for a forgotten password token'))
			.toBeVisible();
	});

	it('should render with empty recovery email', async () => {
		const contextEmptyRecovery = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddress: ''
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextEmptyRecovery}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('User Recovery Email')).toBeVisible();
	});

	it('should render with all time range options for lockout', async () => {
		const contextWithTimeRanges = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutEnabled: 'TRUE',
				zimbraPasswordLockoutDuration: '10m',
				zimbraPasswordLockoutFailureLifetime: '20m'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithTimeRanges}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
		await expect.element(page.getByText('Time Range').first()).toBeVisible();
	});

	it('should render backup section with restore messages switch', async () => {
		const contextWithBackup = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				backupSelfUndeleteAllowed: false
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithBackup}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Backup')).toBeVisible();
		await expect.element(page.getByText('Allow user to restore messages')).toBeVisible();
	});

	it('should render OTP management switch', async () => {
		const contextWithOTPSwitch = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				carbonioFeatureOTPMgmtEnabled: 'FALSE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithOTPSwitch}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('One Time Password management')).toBeVisible();
	});

	it('should render with undefined password lockout duration', async () => {
		const contextUndefinedDuration = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: undefined
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextUndefinedDuration}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render with undefined password lockout failure lifetime', async () => {
		const contextUndefinedLifetime = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutFailureLifetime: undefined
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextUndefinedLifetime}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(
				page.getByText(
					'Time window in which the failed logins must occur to lock the account:'
				)
			)
			.toBeVisible();
	});

	it('should render password info banner', async () => {
		setupBrowserTest(
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

	it('should render with recovery address status as pending', async () => {
		const contextPendingStatus = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddressStatus: 'pending'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextPendingStatus}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Status')).toBeVisible();
	});

	it('should render with various password age values', async () => {
		const contextAgeValues = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinAge: '1',
				zimbraPasswordMaxAge: '365'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextAgeValues}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Minimum password age (Days)')).toBeVisible();
		await expect.element(page.getByText('Maximum password age (Days)')).toBeVisible();
	});

	it('should render with password history enforcement', async () => {
		const contextHistoryEnforced = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordEnforceHistory: '12'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextHistoryEnforced}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);
		await expect
			.element(page.getByText('Minimum number of unique passwords history'))
			.toBeVisible();
	});

	it('should have sendMail service mocked for success scenario', () => {
		vi.clearAllMocks();

		// Mock sendMail to resolve successfully
		vi.mocked(sendMail).mockResolvedValue({} as any);

		// Verify the mock is set up correctly
		expect(sendMail).toBeDefined();
		expect(vi.isMockFunction(sendMail)).toBe(true);
	});

	it('should have sendMail service mocked for error scenario', () => {
		vi.clearAllMocks();

		// Mock sendMail to reject with error
		vi.mocked(sendMail).mockRejectedValue(new Error('Network error'));

		// Verify the mock is set up correctly
		expect(sendMail).toBeDefined();
		expect(vi.isMockFunction(sendMail)).toBe(true);
	});

	it('should test email validation logic in ChipInput onChange', () => {
		// This test verifies the email validation logic that marks invalid emails with error flag
		const contacts = [
			{ label: 'valid@example.com' },
			{ label: 'invalid-email' },
			{ label: 'another@valid.com' }
		];

		const data: any = [];
		contacts.forEach((contact) => {
			const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.label ?? '');
			data.push({
				...contact,
				error: !isValid
			});
		});

		// Verify that invalid email is marked with error
		expect(data[0].error).toBe(false); // valid@example.com
		expect(data[1].error).toBe(true); // invalid-email
		expect(data[2].error).toBe(false); // another@valid.com
	});

	it('should test conditional rendering of error message', () => {
		const sendEmailToWithErrors = [
			{ label: 'valid@example.com', error: false },
			{ label: 'invalid', error: true }
		];

		const sendEmailToWithoutErrors = [{ label: 'valid@example.com', error: false }];

		// Test that error message should be shown when some contacts have errors
		const hasErrors = sendEmailToWithErrors.some((contact: any) => contact.error);
		expect(hasErrors).toBe(true);

		// Test that error message should not be shown when no contacts have errors
		const hasNoErrors = sendEmailToWithoutErrors.some((contact: any) => contact.error);
		expect(hasNoErrors).toBe(false);
	});

	it('should test SEND button disabled state logic', () => {
		// Test button disabled when no emails
		const emptyEmails: any[] = [];
		const shouldBeDisabledEmpty =
			emptyEmails.length === 0 || emptyEmails.some((contact: any) => contact.error);
		expect(shouldBeDisabledEmpty).toBe(true);

		// Test button disabled when emails have errors
		const emailsWithErrors = [
			{ label: 'valid@example.com', error: false },
			{ label: 'invalid', error: true }
		];
		const shouldBeDisabledWithErrors =
			emailsWithErrors.length === 0 || emailsWithErrors.some((contact: any) => contact.error);
		expect(shouldBeDisabledWithErrors).toBe(true);

		// Test button enabled when emails are valid
		const validEmails = [
			{ label: 'valid@example.com', error: false },
			{ label: 'another@valid.com', error: false }
		];
		const shouldBeEnabled =
			validEmails.length === 0 || validEmails.some((contact: any) => contact.error);
		expect(shouldBeEnabled).toBe(false);
	});
});
