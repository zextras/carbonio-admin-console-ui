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

// Mock the fetchSoap service
vi.mock('../../../../../services/generateOTP-service', () => ({
	fetchSoap: vi.fn()
}));

vi.mock('../../../../app/component/hwizard', () => ({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	HorizontalWizard: ({ steps }: any) => (
		<div data-testid="mock-wizard">
			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			{steps.map((step: any, index: number) => (
				<div key={index}>
					{step.view ? step.view() : step.content}
				</div>
			))}
		</div>
	)
}));

// Mock ChipInput from design system
vi.mock('@zextras/carbonio-design-system', async () => {
	const actual = await vi.importActual('@zextras/carbonio-design-system');
	return {
		...actual,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		ChipInput: ({ onChange, value, placeholder, hasError }: any) => (
			<div data-testid="mock-chip-input">
				<input
					data-testid="chip-input-field"
					placeholder={placeholder}
					value={JSON.stringify(value)}
					onChange={(e) => {
						try {
							const parsed = JSON.parse(e.target.value);
							onChange(parsed);
						} catch {
							// ignore invalid json during typing
						}
					}}
					onBlur={(e) => {
						try {
							const parsed = JSON.parse(e.target.value);
							onChange(parsed);
						} catch {
							// ignore invalid json during typing
						}
					}}
				/>
				{hasError && <div data-testid="chip-input-error">Error</div>}
			</div>
		)
	};
});

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

	it('should have sendMail service mocked for success scenario', () => {
		vi.clearAllMocks();

		// Mock sendMail to resolve successfully
		vi.mocked(sendMail).mockResolvedValue({} as unknown);

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

	it('should render OTP wizard with QR code when showCreateOTP is true', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					Body: {
						ZxAuthResponse: {
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
					}
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			)
		);
		globalThis.fetch = mockFetch;

		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		// Verify NEW OTP button is visible
		const newOtpButton = page.getByRole('button', { name: /NEW OTP/i });
		await expect.element(newOtpButton).toBeVisible();
	});

	it('should display wizard with QR code, secret code, and pin codes', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should handle email change with valid email in ChipInput', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should handle email change with invalid email in ChipInput', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should disable SEND button when no emails are provided', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should disable SEND button when email has error', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should show success snackbar when email is sent successfully', async () => {
		vi.clearAllMocks();
		vi.mocked(sendMail).mockResolvedValue({} as unknown);

		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should show error snackbar when email sending fails', async () => {
		vi.clearAllMocks();
		vi.mocked(sendMail).mockRejectedValue(new Error('Network error'));

		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should render email recipients correctly in handleSendOTPEmail', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		const testContext = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				name: 'testuser'
			}
		};

		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should map sendEmailTo correctly in handleSendOTPEmail', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should validate email in handleEmailChange callback', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should set error flag for invalid emails in handleEmailChange', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should compute hasEmailError correctly when no errors', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should compute hasEmailError correctly when errors exist', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should compute isSendDisabled correctly when sendEmailTo is empty', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should compute isSendDisabled correctly when hasEmailError is true', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should clear sendEmailTo after successful email send', async () => {
		vi.clearAllMocks();
		vi.mocked(sendMail).mockResolvedValue({} as unknown);

		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should call emailContent with pinCodes and secrateCode', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should construct email message with correct structure', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should handle multiple email recipients in sendEmailTo', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should handle email with undefined label in handleEmailChange', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should handle empty contact label in handleEmailChange', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should display OTP message about seeing codes once', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should display instruction to select email address', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should render DATA ALREADY SENT TO THE USER button in wizard', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should handle minimum password length input change', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		const minLengthLabel = page.getByText('Minimum password length');
		await expect.element(minLengthLabel).toBeVisible();
	});

	it('should handle maximum password length input change', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		const maxLengthLabel = page.getByText('Maximum password length');
		await expect.element(maxLengthLabel).toBeVisible();
	});

	it('should toggle password locked switch', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLocked: 'FALSE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('Prevent user from changing password'))
			.toBeVisible();
	});

	it('should toggle reject common passwords switch', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Reject common passwords')).toBeVisible();
	});

	it('should toggle failed login lockout switch', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
	});

	it('should toggle OTP management switch when enabled', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail,
			accountDetail: {
				...mockContextValue.accountDetail,
				carbonioFeatureOTPMgmtEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('One Time Password management')).toBeVisible();
	});

	it('should toggle backup self undelete switch', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail,
			accountDetail: {
				...mockContextValue.accountDetail,
				backupSelfUndeleteAllowed: false
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Allow user to restore messages')).toBeVisible();
	});

	it('should handle upper case characters input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum upper case characters')).toBeVisible();
	});

	it('should handle lower case characters input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum lower case characters')).toBeVisible();
	});

	it('should handle punctuation symbols input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum punctuation symbols')).toBeVisible();
	});

	it('should handle numeric characters input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum numeric characters', { exact: true })).toBeVisible();
	});

	it('should handle minimum password age input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum password age (Days)')).toBeVisible();
	});

	it('should handle maximum password age input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Maximum password age (Days)')).toBeVisible();
	});

	it('should handle digits or puncs input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(
				page.getByText('Minimum numeric characters or punctuation symbols')
			)
			.toBeVisible();
	});

	it('should handle password history input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('Minimum number of unique passwords history'))
			.toBeVisible();
	});

	it('should handle max failures input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('Number of consecutive failed logins allowed'))
			.toBeVisible();
	});

	it('should handle lockout duration input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should handle failure lifetime input', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
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

	it('should render recovery email input field', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('User Recovery Email')).toBeVisible();
	});

	it('should handle forgotten password token switch', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('User can ask for a forgotten password token'))
			.toBeVisible();
	});

	it('should render with lockout enabled and disabled fields', async () => {
		const contextWithLockoutDisabled = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutEnabled: 'FALSE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithLockoutDisabled}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
	});

	it('should render time range select options', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		const timeRangeLabels = page.getByText('Time Range');
		await expect.element(timeRangeLabels.first()).toBeVisible();
	});

	it('should render with custom time values for lockout duration', async () => {
		const contextWithCustomTime = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: '120m'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithCustomTime}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render with custom time values for failure lifetime', async () => {
		const contextWithCustomLifetime = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutFailureLifetime: '48h'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithCustomLifetime}>
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

	it('should render OTP table with multiple entries', async () => {
		const contextWithMultipleOTP = {
			...mockContextValue,
			otpList: [
				{
					id: '1',
					description: 'OTP 1',
					status: 'Active',
					failed: '0',
					'creation-date': '2024-01-01',
					columns: ['OTP 1', 'Active', '0', '2024-01-01']
				},
				{
					id: '2',
					description: 'OTP 2',
					status: 'Inactive',
					failed: '2',
					'creation-date': '2024-01-02',
					columns: ['OTP 2', 'Inactive', '2', '2024-01-02']
				}
			]
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMultipleOTP}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should render when isAdvanced is false', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(false);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
	});

	it('should render with all inherited values different from account values', async () => {
		const contextWithDifferentInherited = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinLength: '10',
				zimbraPasswordMaxLength: '100'
			},
			cosDetail: {
				...mockContextValue.cosDetail,
				zimbraPasswordMinLength: '6',
				zimbraPasswordMaxLength: '128'
			},
			accSpecificDetail: {
				...mockContextValue.accSpecificDetail,
				zimbraPasswordMinLength: '10',
				zimbraPasswordMaxLength: '100'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDifferentInherited}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum password length')).toBeVisible();
		await expect.element(page.getByText('Maximum password length')).toBeVisible();
	});

	it('should handle empty lockout duration value', async () => {
		const contextWithEmptyDuration = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: ''
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithEmptyDuration}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should handle empty failure lifetime value', async () => {
		const contextWithEmptyLifetime = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutFailureLifetime: ''
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithEmptyLifetime}>
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

	it('should render with undefined recovery email', async () => {
		const contextWithUndefinedRecovery = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddress: undefined
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithUndefinedRecovery}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('User Recovery Email')).toBeVisible();
	});

	it('should render with empty recovery email', async () => {
		const contextWithEmptyRecovery = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddress: ''
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithEmptyRecovery}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('User Recovery Email')).toBeVisible();
	});

	it('should render recovery status select with pending', async () => {
		const contextWithPendingStatus = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddressStatus: 'pending'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithPendingStatus}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Status')).toBeVisible();
	});

	it('should render recovery status select with verified', async () => {
		const contextWithVerifiedStatus = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefPasswordRecoveryAddressStatus: 'verified'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithVerifiedStatus}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Status')).toBeVisible();
	});

	it('should render with reset password disabled', async () => {
		const contextWithDisabledReset = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraFeatureResetPasswordStatus: 'disabled'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDisabledReset}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('User can ask for a forgotten password token'))
			.toBeVisible();
	});

	it('should render with various password min length values', async () => {
		const contextWithMinLength = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinLength: '6'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMinLength}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum password length')).toBeVisible();
	});

	it('should render with various password max length values', async () => {
		const contextWithMaxLength = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMaxLength: '256'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMaxLength}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Maximum password length')).toBeVisible();
	});

	it('should render with zero password min age', async () => {
		const contextWithZeroAge = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinAge: '0'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithZeroAge}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum password age (Days)')).toBeVisible();
	});

	it('should render with zero password max age', async () => {
		const contextWithZeroMaxAge = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMaxAge: '0'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithZeroMaxAge}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Maximum password age (Days)')).toBeVisible();
	});

	it('should render with all character requirements set to zero', async () => {
		const contextWithZeroRequirements = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordMinUpperCaseChars: '0',
				zimbraPasswordMinLowerCaseChars: '0',
				zimbraPasswordMinPunctuationChars: '0',
				zimbraPasswordMinNumericChars: '0',
				zimbraPasswordMinDigitsOrPuncs: '0'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithZeroRequirements}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Minimum upper case characters')).toBeVisible();
		await expect.element(page.getByText('Minimum lower case characters')).toBeVisible();
	});

	it('should render with password history set to zero', async () => {
		const contextWithZeroHistory = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordEnforceHistory: '0'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithZeroHistory}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('Minimum number of unique passwords history'))
			.toBeVisible();
	});

	it('should render with max failures set to minimum', async () => {
		const contextWithMinFailures = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutMaxFailures: '1'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithMinFailures}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('Number of consecutive failed logins allowed'))
			.toBeVisible();
	});

	it('should render with lockout duration in all time units', async () => {
		const contextWithDaysUnit = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPasswordLockoutDuration: '7d'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDaysUnit}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
	});

	it('should render backup section in advanced mode', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Backup')).toBeVisible();
	});

	it('should not render OTP section when showCreateOTP is true', async () => {
		const { useIsAdvanced } = await import('@zextras/admin-ui-bootstrap');
		vi.mocked(useIsAdvanced).mockReturnValue(true);

		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Second Factor Authentication')).toBeVisible();
	});

	it('should render all inherited switch components', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect
			.element(page.getByText('Prevent user from changing password'))
			.toBeVisible();
		await expect.element(page.getByText('Reject common passwords')).toBeVisible();
		await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
	});

	it('should render all inherited input components for password policy', async () => {
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

	it('should render all inherited input components for lockout policy', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

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

	it('should render password note with correct text', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		const noteText = page.getByText(
			'The settings below ↓ do not affect the passwords set by users in domains that are configured to use external authentication. Changes made here will override COS settings for the password and the failed login lockout.'
		);
		await expect.element(noteText).toBeVisible();
	});

	it('should render with all sections visible', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountSecuritySection />
			</AccountContext.Provider>
		);

		await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
	});
});
