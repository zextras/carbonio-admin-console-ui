/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import { createBrowserAPIInterceptor, getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { EditAccountSecuritySection } from '../security-section';
import { AccountFormTestProvider } from './account-form-test-provider';

const mockAccountDetail = {
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
  zimbraId: 'mock-id',
};

const mockCosDetail = {
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
  zimbraId: 'mock-id',
};

const mockAccSpecificDetail = {
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
  zimbraId: 'mock-id',
};

function wrapSecuritySection(
  accountDetailOverrides: Record<string, unknown> = {},
  contextOverrides: Record<string, unknown> = {},
): React.ReactElement {
  return (
    <AccountFormTestProvider
      values={{ ...mockAccountDetail, ...accountDetailOverrides }}
      contextOverrides={{
        cosDetail: mockCosDetail,
        accSpecificDetail: mockAccSpecificDetail,
        ...contextOverrides,
      }}
    >
      <EditAccountSecuritySection />
    </AccountFormTestProvider>
  );
}

function setupEditAccountSecurityTest(component: React.ReactElement) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  queryClient.setQueryData(domainByIdKey('domain-id', 1), {
    id: 'domain-id',
    name: 'test-domain.com',
    a: [],
  });

  return setupBrowserTest(component, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: '/domain-id',
  });
}

describe('EditAccountSecuritySection (browser)', () => {
  describe('Grace period expiration date', () => {
    const GRACE_FLAGS = {
      carbonioOtpGracePeriodEnabled: 'TRUE',
      carbonioOtpWizardFromUntrusted: 'TRUE',
      carbonioFeatureOTPMgmtEnabled: 'TRUE',
    };

    it('shows the date parsed from the stored grace period ending time', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection({
          ...GRACE_FLAGS,
          carbonioOtpGracePeriodEndingTime: '20260615100000Z',
        }),
      );

      await expect
        .element(page.getByRole('textbox', { name: /set grace period expiration date/i }))
        .toHaveValue('15/06/2026');
    });

    it('falls back to one month from now when enabled without a stored value', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection({ ...GRACE_FLAGS }));

      const expected = new Date();
      expected.setMonth(expected.getMonth() + 1);
      const expectedText = `${String(expected.getDate()).padStart(2, '0')}/${String(
        expected.getMonth() + 1,
      ).padStart(2, '0')}/${expected.getFullYear()}`;

      await expect
        .element(page.getByRole('textbox', { name: /set grace period expiration date/i }))
        .toHaveValue(expectedText);
    });
  });

  describe('Basic Rendering', () => {
    it('should render all main sections', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());
      await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
      await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
    });

    it('should render all password policy fields', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());
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
      setupEditAccountSecurityTest(wrapSecuritySection());
      await expect.element(page.getByText('Prevent user from changing password')).toBeVisible();
      await expect.element(page.getByText('Reject common passwords')).toBeVisible();
    });

    it('should render failed login lockout fields', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());
      await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
      await expect
        .element(page.getByText('Number of consecutive failed logins allowed'))
        .toBeVisible();
      await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
      await expect
        .element(
          page.getByText('Time window in which the failed logins must occur to lock the account:'),
        )
        .toBeVisible();
    });

    it('should render recovery email field', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());
      await expect.element(page.getByText('User Recovery Email')).toBeVisible();
      await expect
        .element(page.getByText('User can ask for a forgotten password token'))
        .toBeVisible();
    });

    it('should render password note for external authentication', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());
      await expect
        .element(
          page.getByText(
            'The settings below ↓ do not affect the passwords set by users in domains that are configured to use external authentication. Changes made here will override COS settings for the password and the failed login lockout.',
          ),
        )
        .toBeVisible();
    });
  });

  describe('Password Policy Variations', () => {
    it('should render with password locked enabled', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection({ zimbraPasswordLocked: 'TRUE' }));
      await expect.element(page.getByText('Prevent user from changing password')).toBeVisible();
    });

    it('should render with common passwords blocked', async () => {
      const overrides_contextWithBlocked = {
        zimbraPasswordBlockCommonEnabled: 'TRUE',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithBlocked));
      await expect.element(page.getByText('Reject common passwords')).toBeVisible();
    });

    it('should render with password history enabled', async () => {
      const overrides_contextWithHistory = {
        zimbraPasswordEnforceHistory: '5',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithHistory));
      await expect
        .element(page.getByText('Minimum number of unique passwords history'))
        .toBeVisible();
    });

    it('should render with all password policies enabled', async () => {
      const overrides_fullContext = {
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
        zimbraPasswordBlockCommonEnabled: 'TRUE',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_fullContext));
      await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
    });
  });

  describe('Failed Login Policy Variations', () => {
    it('should render with lockout enabled', async () => {
      const overrides_contextWithLockout = {
        zimbraPasswordLockoutEnabled: 'TRUE',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithLockout));
      await expect.element(page.getByText('Enable failed login lockout')).toBeVisible();
    });

    it('should render with lockout duration in seconds', async () => {
      const overrides_contextWithDuration = {
        zimbraPasswordLockoutDuration: '30s',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithDuration));
      await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
    });

    it('should render with lockout duration in minutes', async () => {
      const overrides_contextWithDuration = {
        zimbraPasswordLockoutDuration: '15m',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithDuration));
      await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
    });

    it('should render with lockout duration in hours', async () => {
      const overrides_contextWithDuration = {
        zimbraPasswordLockoutDuration: '2h',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithDuration));
      await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
    });

    it('should render with lockout duration in days', async () => {
      const overrides_contextWithDuration = {
        zimbraPasswordLockoutDuration: '2d',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithDuration));
      await expect.element(page.getByText('Time to lockout the account')).toBeVisible();
    });

    it('should render with failure lifetime in minutes', async () => {
      const overrides_contextWithLifetime = {
        zimbraPasswordLockoutFailureLifetime: '30m',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithLifetime));
      await expect
        .element(
          page.getByText('Time window in which the failed logins must occur to lock the account:'),
        )
        .toBeVisible();
    });

    it('should render with failure lifetime in hours', async () => {
      const overrides_contextWithLifetime = {
        zimbraPasswordLockoutFailureLifetime: '2h',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithLifetime));
      await expect
        .element(
          page.getByText('Time window in which the failed logins must occur to lock the account:'),
        )
        .toBeVisible();
    });

    it('should render with failure lifetime in days', async () => {
      const overrides_contextWithLifetime = {
        zimbraPasswordLockoutFailureLifetime: '7d',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithLifetime));
      await expect
        .element(
          page.getByText('Time window in which the failed logins must occur to lock the account:'),
        )
        .toBeVisible();
    });

    it('should render with all lockout policies enabled', async () => {
      const overrides_lockoutContext = {
        zimbraPasswordLockoutEnabled: 'TRUE',
        zimbraPasswordLockoutMaxFailures: '3',
        zimbraPasswordLockoutDuration: '24h',
        zimbraPasswordLockoutFailureLifetime: '1d',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_lockoutContext));
      await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
    });
  });

  describe('Recovery Settings', () => {
    it('should render with recovery email address', async () => {
      const overrides_contextWithRecovery = {
        zimbraPrefPasswordRecoveryAddress: 'recovery@example.com',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithRecovery));
      await expect.element(page.getByText('User Recovery Email')).toBeVisible();
    });

    it('should render with reset password enabled', async () => {
      const overrides_contextWithReset = {
        zimbraFeatureResetPasswordStatus: 'enabled',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithReset));
      await expect
        .element(page.getByText('User can ask for a forgotten password token'))
        .toBeVisible();
    });

    it('should render with verified recovery status', async () => {
      const overrides_contextWithVerified = {
        zimbraPrefPasswordRecoveryAddressStatus: 'verified',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithVerified));
      await expect.element(page.getByText('Status')).toBeVisible();
    });

    it('should render with full recovery settings', async () => {
      const overrides_recoveryContext = {
        zimbraFeatureResetPasswordStatus: 'enabled',
        zimbraPrefPasswordRecoveryAddress: 'test@example.com',
        zimbraPrefPasswordRecoveryAddressStatus: 'verified',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_recoveryContext));
      await expect.element(page.getByText('Forgotten Password', { exact: true })).toBeVisible();
    });
  });

  describe('OTP and Backup Features', () => {
    it('should render with OTP management enabled', async () => {
      const overrides_contextWithOTP = {
        carbonioFeatureOTPMgmtEnabled: 'TRUE',
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithOTP));
      await expect.element(page.getByText('Allow users to configure 2FA')).toBeVisible();
    });

    it('should render with backup self undelete allowed', async () => {
      const overrides_contextWithBackup = {
        backupSelfUndeleteAllowed: true,
      };
      setupEditAccountSecurityTest(wrapSecuritySection(overrides_contextWithBackup));
      await expect.element(page.getByText('Backup')).toBeVisible();
      await expect.element(page.getByText('Allow user to restore messages')).toBeVisible();
    });

    it('should render with empty OTP list', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection({}, { otpList: [] }));
      await expect
        .element(page.getByText('Two-Factor authenticator', { exact: true }))
        .toBeVisible();
      await expect.element(page.getByText('This list is empty.')).toBeVisible();
    });

    it('should render OTP list when available', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection(
          {},
          {
            otpList: [
              {
                id: '1',
                label: 'Test OTP',
                enabled: true,
                failed_attempts: 0,
                created: '2024-01-01',
                description: 'Test OTP',
              },
            ],
          },
        ),
      );
      await expect
        .element(page.getByText('Two-Factor authenticator', { exact: true }))
        .toBeVisible();
    });

    it('should render NEW OTP and DELETE buttons', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());
      await expect.element(page.getByRole('button', { name: /NEW OTP/i })).toBeVisible();
      await expect.element(page.getByText('DELETE')).toBeVisible();
    });

    it('should show restore action only for disabled OTP rows', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection(
          {},
          {
            otpList: [
              {
                id: 'disabled-otp-id',
                label: 'Disabled OTP',
                enabled: false,
                failed_attempts: 3,
                created: '2024-01-01',
              },
              {
                id: 'enabled-otp-id',
                label: 'Enabled OTP',
                enabled: true,
                failed_attempts: 0,
                created: '2024-01-02',
              },
            ],
          },
        ),
      );

      await expect.element(page.getByText('Actions')).toBeVisible();
      await expect.element(page.getByTestId('restore-otp-disabled-otp-id')).toBeVisible();
      await expect.element(page.getByTestId('restore-otp-enabled-otp-id')).not.toBeInTheDocument();
    });

    it('should open restore confirmation modal when restore action is clicked', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection(
          {},
          {
            otpList: [
              {
                id: 'disabled-otp-id',
                label: 'Disabled OTP',
                enabled: false,
                failed_attempts: 3,
                created: '2024-01-01',
              },
            ],
          },
        ),
      );

      await page.getByTestId('restore-otp-disabled-otp-id').click();

      await expect.element(page.getByText('Restore OTP')).toBeVisible();
      await expect
        .element(
          page.getByText(
            'Before proceeding, verify the user requested this. If you suspect an unauthorized attack, do not restore.',
          ),
        )
        .toBeVisible();
      await expect.element(page.getByText('NO, CANCEL')).toBeVisible();
      await expect.element(page.getByText('YES, RESTORE ANYWAY')).toBeVisible();
    });

    it('should restore OTP and show success snackbar when restore is confirmed', async () => {
      await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
        HttpResponse.json({
          Header: {
            context: { change: { token: 38684 }, _jsns: 'urn:zimbra' },
          },
          Body: {
            response: {
              content: JSON.stringify({ ok: true, message: 'ok' }),
            },
          },
          _jsns: 'urn:zimbraSoap',
        }),
      );

      setupEditAccountSecurityTest(
        wrapSecuritySection(
          {},
          {
            otpList: [
              {
                id: 'disabled-otp-id',
                label: 'Disabled OTP',
                enabled: false,
                failed_attempts: 3,
                created: '2024-01-01',
              },
            ],
          },
        ),
      );

      await page.getByTestId('restore-otp-disabled-otp-id').click();
      await page.getByRole('button', { name: /YES, RESTORE ANYWAY/i }).click();

      await expect.element(page.getByText('OTP has been restored successfully')).toBeVisible();
      await expect.element(page.getByText('Restore OTP')).not.toBeInTheDocument();
    });

    it('should show error snackbar when restore response has ok false', async () => {
      await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({ ok: false, message: 'restore failed' }),
            },
          },
        }),
      );

      setupEditAccountSecurityTest(
        wrapSecuritySection(
          {},
          {
            otpList: [
              {
                id: 'disabled-otp-id',
                label: 'Disabled OTP',
                enabled: false,
                failed_attempts: 3,
                created: '2024-01-01',
              },
            ],
          },
        ),
      );

      await page.getByTestId('restore-otp-disabled-otp-id').click();
      await page.getByRole('button', { name: /YES, RESTORE ANYWAY/i }).click();

      await expect.element(page.getByText('Something went wrong. Please try again.')).toBeVisible();
    });

    it('should show error snackbar when restore response content is malformed', async () => {
      await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: '{"ok":',
            },
          },
        }),
      );

      setupEditAccountSecurityTest(
        wrapSecuritySection(
          {},
          {
            otpList: [
              {
                id: 'disabled-otp-id',
                label: 'Disabled OTP',
                enabled: false,
                failed_attempts: 3,
                created: '2024-01-01',
              },
            ],
          },
        ),
      );

      await page.getByTestId('restore-otp-disabled-otp-id').click();
      await page.getByRole('button', { name: /YES, RESTORE ANYWAY/i }).click();

      await expect.element(page.getByText('Something went wrong. Please try again.')).toBeVisible();
    });
  });

  describe('Inherited Values and Reset', () => {
    it('should render reset buttons for inherited fields', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection(
          {},
          {
            accSpecificDetail: { ...mockAccSpecificDetail, zimbraPasswordLocked: 'TRUE' },
          },
        ),
      );
      const resetButton = page.getByTestId('reset-zimbraPasswordLocked');
      await expect.element(resetButton).toBeVisible();
    });

    it('should update the form when carbonioFeatureOTPMgmtEnabled reset is clicked', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection(
          { carbonioFeatureOTPMgmtEnabled: 'TRUE' },
          {
            accSpecificDetail: { ...mockAccSpecificDetail, carbonioFeatureOTPMgmtEnabled: 'FALSE' },
            cosDetail: { ...mockCosDetail, carbonioFeatureOTPMgmtEnabled: 'FALSE' },
          },
        ),
      );
      const resetButton = page.getByTestId('reset-carbonioFeatureOTPMgmtEnabled');
      await expect.element(resetButton).toBeVisible();

      const otpSwitch = page.getByRole('switch', { name: 'Allow users to configure 2FA' });
      await expect.element(otpSwitch).toHaveAttribute('aria-checked', 'true');

      await resetButton.click();

      await expect.element(otpSwitch).toHaveAttribute('aria-checked', 'false');
    });

    it('should update the form when reset button is clicked', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection(
          { zimbraPasswordLocked: 'TRUE' },
          {
            accSpecificDetail: { ...mockAccSpecificDetail, zimbraPasswordLocked: 'FALSE' },
          },
        ),
      );
      const resetButton = page.getByTestId('reset-zimbraPasswordLocked');
      await expect.element(resetButton).toBeVisible();

      const lockSwitch = page.getByRole('switch', { name: 'Prevent user from changing password' });
      await expect.element(lockSwitch).toHaveAttribute('aria-checked', 'true');

      await resetButton.click();

      await expect.element(lockSwitch).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty accountDetail', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection({}));
      await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
    });

    it('should render with minimal accountDetail', async () => {
      setupEditAccountSecurityTest(
        wrapSecuritySection({ uid: 'test-user', name: 'test-user', zimbraId: 'min-test-id' }),
      );
      await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
    });

    it('should render when isAdvanced is false', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());

      await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
    });
  });

  describe('Email Sending for OTP', () => {
    it('should render OTP wizard with QR code when showCreateOTP is true', async () => {
      createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
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
                { code: '666666' },
              ],
            },
          },
        }),
      );

      setupEditAccountSecurityTest(wrapSecuritySection());

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
          page.getByText(`Select an email address to send the OTP to or copy the code above`),
        )
        .toBeVisible();
    });

    it('should render OTP wizard with send OTP email input when showCreateOTP is true', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());

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
                { code: '666666' },
              ],
            },
          },
        }),
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
    });
    it('should display invalid email msg and button should be disabled for invalid email', async () => {
      setupEditAccountSecurityTest(wrapSecuritySection());

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
                { code: '666666' },
              ],
            },
          },
        }),
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
      setupEditAccountSecurityTest(wrapSecuritySection());

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
                { code: '666666' },
              ],
            },
          },
        }),
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

    it('should show error snackbar when sendMail fails', async () => {
      let requestCount = 0;
      setupEditAccountSecurityTest(wrapSecuritySection());

      await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () => {
        requestCount++;
        // First request is for OTP generation, second is for sendMail
        if (requestCount === 1) {
          return HttpResponse.json({
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
                  { code: '666666' },
                ],
              },
            },
          });
        }
        // Simulate sendMail failure
        return HttpResponse.json(
          {
            Body: {
              Fault: {
                Code: { Value: 'soap:Sender' },
                Reason: { Text: 'Failed to send mail' },
              },
            },
          },
          { status: 500 },
        );
      });

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

      // Verify error snackbar is shown
      await expect.element(page.getByText('Something went wrong. Please try again.')).toBeVisible();
    });
  });

  describe('DatePicker', () => {
    const enabledOtpOverrides = {
      carbonioFeatureOTPMgmtEnabled: 'TRUE',
      carbonioOtpWizardFromUntrusted: 'TRUE',
      carbonioOtpGracePeriodEnabled: 'TRUE',
    };

    const overrides_disabledOtpContext = {
      carbonioFeatureOTPMgmtEnabled: 'TRUE',
      carbonioOtpWizardFromUntrusted: 'TRUE',
      carbonioOtpGracePeriodEnabled: 'FALSE',
    };

    function setupAdvancedSecurityTest(component: React.ReactElement) {
      return setupEditAccountSecurityTest(component);
    }

    it('should render grace period expiration date picker when grace period is enabled', async () => {
      setupAdvancedSecurityTest(wrapSecuritySection(enabledOtpOverrides));

      await expect.element(page.getByPlaceholder('Set grace period expiration date')).toBeVisible();
    });

    it('should disable the date picker when grace period is disabled', async () => {
      setupAdvancedSecurityTest(wrapSecuritySection(overrides_disabledOtpContext));

      await expect
        .element(page.getByPlaceholder('Set grace period expiration date'))
        .toBeDisabled();
    });

    it('should enable the date picker when all OTP features are enabled', async () => {
      setupAdvancedSecurityTest(wrapSecuritySection(enabledOtpOverrides));

      await expect.element(page.getByPlaceholder('Set grace period expiration date')).toBeEnabled();
    });

    it('should open the calendar popover when the calendar icon is clicked', async () => {
      setupAdvancedSecurityTest(wrapSecuritySection(enabledOtpOverrides));

      await page.getByRole('button', { name: 'Calendar' }).click();

      await expect.element(page.getByRole('grid')).toBeVisible();
    });
  });
});
