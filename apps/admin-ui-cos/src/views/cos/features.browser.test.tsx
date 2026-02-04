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
  cosLevelFeatures: true,
};

describe('Features (browser)', () => {
  it('should render 2FA section when cosLevelFeatures is true', async () => {
    setupBrowserTest(<Features {...mockProps} />);
    await expect.element(page.getByText('Two-Factor authenticator')).toBeVisible();
    await expect.element(page.getByText('Allow users to configure 2FA')).toBeVisible();
    await expect.element(page.getByText('Users will be able to set up and manage their One-Time Password (OTP) from their profile settings.')).toBeVisible();
  });

  it('should toggle 2FA switch', async () => {
    const setFeaturesDetail = vi.fn();
    setupBrowserTest(<Features {...mockProps} setFeaturesDetail={setFeaturesDetail} />);
    const switchLabel = page.getByText('Allow users to configure 2FA');
    await userEvent.click(switchLabel);
    expect(setFeaturesDetail).toHaveBeenCalled();
  });
});
