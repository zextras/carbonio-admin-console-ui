/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Features } from './features';

const mockProps = {
  featuresDetail: {
    carbonioFeatureOTPMgmtEnabled: 'FALSE',
  },
  setFeaturesDetail: () => {},
  cosDetail: {
    carbonioFeatureOTPMgmtEnabled: 'FALSE',
  },
  accSpecificDetail: {
    carbonioFeatureOTPMgmtEnabled: 'FALSE',
  },
  setEmptyValue: () => {},
  readonlyFeatures: false,
  cosLevelFeatures: false,
};

const enabledProps = {
  ...mockProps,
  featuresDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
    carbonioOtpWizardFromUntrusted: 'TRUE',
    carbonioOtpGracePeriodEnabled: 'TRUE',
  },
  cosDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
    carbonioOtpWizardFromUntrusted: 'TRUE',
    carbonioOtpGracePeriodEnabled: 'TRUE',
  },
  accSpecificDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
    carbonioOtpWizardFromUntrusted: 'TRUE',
    carbonioOtpGracePeriodEnabled: 'TRUE',
  },
};

const disabledProps = {
  ...mockProps,
  featuresDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
    carbonioOtpWizardFromUntrusted: 'TRUE',
    carbonioOtpGracePeriodEnabled: 'FALSE',
  },
  cosDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
    carbonioOtpWizardFromUntrusted: 'TRUE',
    carbonioOtpGracePeriodEnabled: 'FALSE',
  },
  accSpecificDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
    carbonioOtpWizardFromUntrusted: 'TRUE',
    carbonioOtpGracePeriodEnabled: 'FALSE',
  },
};

function setupAdvancedTest(ui: React.ReactElement) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  return setupBrowserTest(ui, { queryClient });
}

function getCalendarButton() {
  return page.getByRole('button', { name: 'Calendar' }).first();
}

describe('Features (browser)', () => {
  it('should render 2FA section when cosLevelFeatures is true', async () => {
    setupBrowserTest(<Features {...mockProps} cosLevelFeatures />);
    await expect.element(page.getByText('Two-Factor authenticator')).toBeVisible();
    await expect.element(page.getByText('Allow users to configure 2FA')).toBeVisible();
    await expect.element(page.getByText('Users will be able to set up and manage their One-Time Password (OTP) from their profile settings.')).toBeVisible();
  });

  it('should toggle 2FA switch', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} cosLevelFeatures setFeaturesDetail={setFeaturesDetail} />);
    const switchLabel = page.getByText('Allow users to configure 2FA');
    await userEvent.click(switchLabel);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });

  describe('DateTimePicker', () => {
    it('should render grace period expiration date picker when grace period is enabled', async () => {
      setupAdvancedTest(<Features {...enabledProps} />);

      await expect
        .element(page.getByPlaceholder('Set grace period expiration date'))
        .toBeVisible();
    });

    it('should disable the date picker when grace period is disabled', async () => {
      setupAdvancedTest(<Features {...disabledProps} />);

      await expect
        .element(page.getByPlaceholder('Set grace period expiration date'))
        .toBeDisabled();
    });

    it('should enable the date picker when grace period is enabled', async () => {
      setupAdvancedTest(<Features {...enabledProps} />);

      await expect
        .element(page.getByPlaceholder('Set grace period expiration date'))
        .toBeEnabled();
    });

    it('should open the calendar popover when the calendar icon is clicked', async () => {
      setupAdvancedTest(<Features {...enabledProps} />);

      await getCalendarButton().click();

      await expect.element(page.getByRole('grid')).toBeVisible();
    });

  });
});
