/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { OtpList } from '../security-section/otp-list';
import { AccountFormTestProvider } from './account-form-test-provider';

const mockAccountDetail = {
  uid: 'test-user',
  name: 'test-user',
  zimbraId: 'mock-id',
  carbonioFeatureOTPMgmtEnabled: 'TRUE',
};

const mockCosDetail = {
  carbonioFeatureOTPMgmtEnabled: 'FALSE',
  zimbraId: 'mock-id',
};

const mockAccSpecificDetail = {
  carbonioFeatureOTPMgmtEnabled: 'FALSE',
  zimbraId: 'mock-id',
};

const OTP_ENTRIES = [
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
];

function wrapOtpList(otpList = OTP_ENTRIES): React.ReactElement {
  return (
    <AccountFormTestProvider
      values={mockAccountDetail}
      contextOverrides={{
        cosDetail: mockCosDetail,
        accSpecificDetail: mockAccSpecificDetail,
        otpList,
      }}
    >
      <OtpList onGenerate={(): void => {}} />
    </AccountFormTestProvider>
  );
}

function setupOtpListTest(component: React.ReactElement) {
  const queryClient = getQueryClient();
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

describe('OtpList (browser)', () => {
  it('renders the OTP rows with status and creation date', async () => {
    setupOtpListTest(wrapOtpList());

    await expect.element(page.getByText('Disabled OTP')).toBeVisible();
    await expect.element(page.getByText('Enabled OTP')).toBeVisible();
    await expect.element(page.getByText('Disabled', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Enabled', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('3').first()).toBeVisible();
  });

  it('shows the empty state when no OTP exists', async () => {
    setupOtpListTest(wrapOtpList([]));

    await expect.element(page.getByText('This list is empty.')).toBeVisible();
    await expect.element(page.getByText('Disabled OTP')).not.toBeInTheDocument();
  });

  it('shows NEW OTP and disabled DELETE until a row is selected', async () => {
    setupOtpListTest(wrapOtpList());

    await expect.element(page.getByRole('button', { name: /NEW OTP/i })).toBeVisible();
    const deleteButton = page.getByRole('button', { name: /^DELETE$/i });
    await expect.element(deleteButton).toBeVisible();
    await expect.element(deleteButton).toBeDisabled();
  });

  it('shows the restore action only for disabled OTP rows', async () => {
    setupOtpListTest(wrapOtpList());

    await expect.element(page.getByTestId('restore-otp-disabled-otp-id')).toBeVisible();
    await expect
      .element(page.getByTestId('restore-otp-enabled-otp-id'))
      .not.toBeInTheDocument();
  });

  it('restores a disabled OTP through the confirmation modal', async () => {
    await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
      HttpResponse.json({
        Body: {
          response: {
            content: JSON.stringify({ ok: true, message: 'ok' }),
          },
        },
      }),
    );

    setupOtpListTest(wrapOtpList());

    await page.getByTestId('restore-otp-disabled-otp-id').click();
    await expect.element(page.getByText('Restore OTP')).toBeVisible();

    await page.getByRole('button', { name: /YES, RESTORE ANYWAY/i }).click();

    await expect
      .element(page.getByText('OTP has been restored successfully'))
      .toBeVisible();
    await expect.element(page.getByText('Restore OTP')).not.toBeInTheDocument();
  });

  it('shows the error snackbar when the restore call rejects', async () => {
    await createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
      HttpResponse.json(
        {
          Body: {
            response: {
              content: 'not-valid-json',
            },
          },
        },
        { status: 500 },
      ),
    );

    setupOtpListTest(wrapOtpList());

    await page.getByTestId('restore-otp-disabled-otp-id').click();
    await page.getByRole('button', { name: /YES, RESTORE ANYWAY/i }).click();

    await expect
      .element(page.getByText('Something went wrong. Please try again.'))
      .toBeVisible();
  });
});
