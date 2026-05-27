/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Features } from './features';

const mockProps = {
  featuresDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
    zimbraFeatureOptionsEnabled: 'TRUE',
    zimbraFeatureSignaturesEnabled: 'TRUE',
    zimbraFeatureOutOfOfficeReplyEnabled: 'TRUE',
    carbonioFeatureMailsAppEnabled: 'TRUE',
    zimbraFeatureContactsEnabled: 'TRUE',
    zimbraFeatureCalendarEnabled: 'TRUE',
    carbonioFeatureFilesEnabled: 'TRUE',
    carbonioFeatureFilesAppEnabled: 'TRUE',
    carbonioFeatureTasksEnabled: 'TRUE',
    carbonioOtpWizardFromUntrusted: 'FALSE',
    carbonioOtpGracePeriodEnabled: 'FALSE',
    carbonioOtpGracePeriodEndingTime: '',
  },
  setFeaturesDetail: vi.fn(),
  cosDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
  },
  accSpecificDetail: {
    carbonioFeatureOTPMgmtEnabled: 'TRUE',
  },
  setEmptyValue: vi.fn(),
  readonlyFeatures: false,
  cosLevelFeatures: true,
};

describe('Features (browser)', () => {
  it('should render 2FA section when cosLevelFeatures is true', async () => {
    setupBrowserTest(<Features {...mockProps} />);
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
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    const switchLabel = page.getByText('Allow users to configure 2FA');
    await userEvent.click(switchLabel);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });

  it('should render Mobile App switch in Mail section and be clickable', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
    const mobileAppSwitch = page.getByText('Mobile App').first();
    await userEvent.click(mobileAppSwitch);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });

  it('should render Contacts Web Feature switch and be clickable', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    const webFeatureSwitch = page.getByText('Web Feature').nth(0);
    await userEvent.click(webFeatureSwitch);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });

  it('should render Calendar Web Feature switch and be clickable', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    const webFeatureSwitch = page.getByText('Web Feature').nth(1);
    await userEvent.click(webFeatureSwitch);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });

  it('should render Files Web Feature switch and be clickable', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    const webFeatureSwitch = page.getByText('Web Feature').nth(2);
    await userEvent.click(webFeatureSwitch);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });

  it('should render Tasks Web Feature switch and be clickable', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    const webFeatureSwitch = page.getByText('Web Feature').nth(3);
    await userEvent.click(webFeatureSwitch);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });

  it('should disable Files Mobile App switch when Files Web Feature is FALSE', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(
      <Features
        {...mockProps}
        featuresDetail={{
          ...mockProps.featuresDetail,
          carbonioFeatureFilesEnabled: 'FALSE',
        }}
        setFeaturesDetail={setFeaturesDetail}
      />,
    );
    const filesMobileApp = page.getByText('Mobile App').nth(1);
    await userEvent.click(filesMobileApp);
    expect(setFeaturesDetail).not.toHaveBeenCalled();
  });

  it('should call setFeaturesDetail with correct toggled value when a switch is clicked', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    await userEvent.click(page.getByText('Allow users to configure 2FA'));
    expect(setFeaturesDetail).toHaveBeenCalledOnce();
    const updater = setFeaturesDetail.mock.calls[0][0];
    const result = updater({ carbonioFeatureOTPMgmtEnabled: 'TRUE' });
    expect(result).toEqual({ carbonioFeatureOTPMgmtEnabled: 'FALSE' });
  });

  it('should disable all switches when readonlyFeatures is true', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(
      <Features {...mockProps} readonlyFeatures setFeaturesDetail={setFeaturesDetail} />,
    );
    await userEvent.click(page.getByText('Allow users to configure 2FA'));
    await userEvent.click(page.getByText('Mobile App').first());
    await userEvent.click(page.getByText('Can access Settings'));
    expect(setFeaturesDetail).not.toHaveBeenCalled();
  });

  it('should toggle changeSwitchOption from TRUE to FALSE', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    await userEvent.click(page.getByText('Allow users to configure 2FA'));
    const updater = setFeaturesDetail.mock.calls[0][0];
    expect(updater({ carbonioFeatureOTPMgmtEnabled: 'TRUE' })).toEqual({
      carbonioFeatureOTPMgmtEnabled: 'FALSE',
    });
  });

  it('should toggle changeSwitchOption from FALSE to TRUE', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(
      <Features
        {...mockProps}
        featuresDetail={{
          ...mockProps.featuresDetail,
          carbonioFeatureOTPMgmtEnabled: 'FALSE',
        }}
        setFeaturesDetail={setFeaturesDetail}
      />,
    );
    await userEvent.click(page.getByText('Allow users to configure 2FA'));
    const updater = setFeaturesDetail.mock.calls[0][0];
    expect(updater({ carbonioFeatureOTPMgmtEnabled: 'FALSE' })).toEqual({
      carbonioFeatureOTPMgmtEnabled: 'TRUE',
    });
  });

  it('should not show Two-Factor authenticator section when cosLevelFeatures is false', async () => {
    setupBrowserTest(<Features {...mockProps} cosLevelFeatures={false} />);
    await expect
      .element(page.getByText('Allow users to configure 2FA'))
      .not.toBeInTheDocument();
  });

  it('should call changeSwitchOption with carbonioFeatureMailsAppEnabled for Mail Mobile App', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    await userEvent.click(page.getByText('Mobile App').first());
    expect(setFeaturesDetail).toHaveBeenCalledOnce();
    const updater = setFeaturesDetail.mock.calls[0][0];
    const result = updater({ carbonioFeatureMailsAppEnabled: 'TRUE' });
    expect(result).toEqual({ carbonioFeatureMailsAppEnabled: 'FALSE' });
  });
});
