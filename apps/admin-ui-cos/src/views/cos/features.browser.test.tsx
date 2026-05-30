/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type Attribute } from '../../../types/attribute';
import { FeaturesForm } from './features-form';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const MOCK_COS_INFORMATION: Array<Attribute> = [
  { n: 'zimbraId', _content: COS_ID },
  { n: 'carbonioFeatureMailsAppEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureOutOfOfficeReplyEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureSignaturesEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureContactsEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureCalendarEnabled', _content: 'TRUE' },
  { n: 'carbonioFeatureFilesEnabled', _content: 'TRUE' },
  { n: 'carbonioFeatureFilesAppEnabled', _content: 'TRUE' },
  { n: 'carbonioFeatureTasksEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureOptionsEnabled', _content: 'TRUE' },
  { n: 'carbonioOtpWizardFromUntrusted', _content: 'FALSE' },
  { n: 'carbonioFeatureOTPMgmtEnabled', _content: 'TRUE' },
  { n: 'carbonioOtpGracePeriodEnabled', _content: 'FALSE' },
  { n: 'carbonioOtpGracePeriodEndingTime', _content: '' },
];

const MOCK_MOBILE_ATTRIBUTES = {
  attributes: {
    mobileContactFeatureSync: [{ value: 'disabled' }],
    mobileCalendarFeatureSync: [{ value: 'disabled' }],
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
  cosLevelFeatures: true,
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
  cosLevelFeatures: true,
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
    await expect
      .element(
        page.getByText(
          'Users will be able to set up and manage their One-Time Password (OTP) from their profile settings.',
        ),
      )
      .toBeVisible();
  });

  it('should toggle 2FA switch', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} cosLevelFeatures setFeaturesDetail={setFeaturesDetail} />);
    const switchLabel = page.getByText('Allow users to configure 2FA');
    await userEvent.click(switchLabel);
    await expect.element(switchLabel).toBeVisible();
  });

  it('should render Mobile App switch in Mail section and be clickable', async () => {
    await setupTest();
    await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
    const mobileAppSwitch = page.getByText('Mobile App').first();
    await userEvent.click(mobileAppSwitch);
  });

  it('should render Contacts Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(0);
    await userEvent.click(webFeatureSwitch);
  });

  it('should render Calendar Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(1);
    await userEvent.click(webFeatureSwitch);
  });

  it('should render Files Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(2);
    await userEvent.click(webFeatureSwitch);
  });

  it('should render Tasks Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(3);
    await userEvent.click(webFeatureSwitch);
  });

  it('should disable Files Mobile App when Files Web Feature is FALSE', async () => {
    await setupTest(
      <TestWrapper
        cosInformation={MOCK_COS_INFORMATION.map((a) =>
          a.n === 'carbonioFeatureFilesEnabled' ? { ...a, _content: 'FALSE' } : a,
        )}
      />,
    );
    const filesMobileApp = page.getByText('Mobile App').nth(1);
    await userEvent.click(filesMobileApp);
  });

  it('should render General section with Can access Settings', async () => {
    await setupTest();
    await expect.element(page.getByText('General')).toBeVisible();
    await expect.element(page.getByText('Can access Settings')).toBeVisible();
  });

  it('should render all feature sections', async () => {
    await setupTest();
    await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Contacts', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Calendar', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Files', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Tasks', { exact: true })).toBeVisible();
  });

  describe('DatePicker', () => {
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
