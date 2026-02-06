/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  delayedSoapApiForBrowser,
  getAllConfigRightsResponseMock,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { Subscription } from '../subscription';

// Mock data that matches what the React Query hooks expect (after parsing)
const mockLicenseData = {
  response: {
    subType: 'PERPETUAL',
    expired: false,
    dateStart: 1652140800000,
    dateEnd: 1855526400000,
    maintenanceEndDate: 1750272000000, // 18 Jun 2025
    maintenanceStatus: 'expired' as const,
    type: 'Purchased',
    customer: 'Test Customer',
    accountCount: 7,
    licensedUsers: '99',
    notYetValid: false,
    infrastructureId: '8b2458ac-61e5-47c0-b70b-d27701c3c68d',
    authenticationToken: 'PERPETUAL_LIC',
    endUser: 'Test End User',
    features: [
      { name: 'backup_realtime', quantity: 'unlimited', enabled: true },
      { name: 'chats_recording', quantity: 'unlimited', enabled: true },
      { name: 'files_basic', quantity: 'unlimited', enabled: true },
      { name: 'storages_basic', quantity: 'unlimited', enabled: true },
      { name: 'admins_basic', quantity: 'unlimited', enabled: true },
    ],
  },
  ok: true,
};

const mockVersionData = {
  response: {
    version: '24.10.0',
  },
  ok: true,
};

type SetupOptions = {
  licenseData?: any;
  versionData?: unknown;
};

const setupSubscriptionTest = (component: React.ReactElement, options?: SetupOptions) => {
  const queryClient = getQueryClient();

  if (options?.licenseData) {
    queryClient.setQueryData(['subscription', 'license'], options.licenseData);
  }
  if (options?.versionData) {
    queryClient.setQueryData(['subscription', 'version'], options.versionData);
  }

  return setupBrowserTest(component, { queryClient });
};

describe('Subscription - License Banner', () => {
  beforeEach(async () => {
    await grantUserConfigRights();
  });

  it('should display license banner when maintenance status is expired and subType is PERPETUAL', async () => {
    setupSubscriptionTest(<Subscription />, {
      licenseData: mockLicenseData,
      versionData: mockVersionData,
    });

    // Match either 18 or 19 Jun 2025 depending on timezone
    await expect.element(page.getByText(/Maintenance has expired./i)).toBeVisible();
  });

  it('should display license banner when maintenance status is expiring and subType is PERPETUAL', async () => {
    const expiringLicenseData = {
      ...mockLicenseData,
      response: {
        ...mockLicenseData.response,
        maintenanceStatus: 'expiring' as const,
      },
    };

    setupSubscriptionTest(<Subscription />, {
      licenseData: expiringLicenseData,
      versionData: mockVersionData,
    });

    // Match either 18 or 19 Jun 2025 depending on timezone
    await expect.element(page.getByText(/Maintenance expires on (18|19) Jun 2025/i)).toBeVisible();
  });

  it('should not display license banner when maintenance status is active', async () => {
    const activeLicenseData = {
      ...mockLicenseData,
      response: {
        ...mockLicenseData.response,
        maintenanceStatus: 'active' as const,
      },
    };

    setupSubscriptionTest(<Subscription />, {
      licenseData: activeLicenseData,
      versionData: mockVersionData,
    });

    const bannerTexts = page.getByText(/Your maintenance/i).elements();
    expect(bannerTexts).toHaveLength(0);
  });

  it('should not display license banner when subType is not PERPETUAL', async () => {
    const regularLicenseData = {
      ...mockLicenseData,
      response: {
        ...mockLicenseData.response,
        subType: 'REGULAR',
      },
    };

    setupSubscriptionTest(<Subscription />, {
      licenseData: regularLicenseData,
      versionData: mockVersionData,
    });

    const bannerTexts = page.getByText(/Your maintenance/i).elements();
    expect(bannerTexts).toHaveLength(0);
  });

  it('should hide license banner when close button is clicked', async () => {
    setupSubscriptionTest(<Subscription />, {
      licenseData: mockLicenseData,
      versionData: mockVersionData,
    });

    // Match either 18 or 19 Jun 2025 depending on timezone
    await expect.element(page.getByText(/Maintenance has expired./i)).toBeVisible();

    const closeButton = page.getByTestId('license-banner-close-button');
    await closeButton.click();

    const bannerTexts = page.getByText(/Your maintenance/i).elements();
    expect(bannerTexts).toHaveLength(0);
  });

  it('should render subscription details section', async () => {
    const activeLicenseData = {
      ...mockLicenseData,
      response: {
        ...mockLicenseData.response,
        maintenanceStatus: 'active' as const,
      },
    };

    setupSubscriptionTest(<Subscription />, {
      licenseData: activeLicenseData,
      versionData: mockVersionData,
    });

    await expect.element(page.getByText('Details')).toBeVisible();
    await expect.element(page.getByText('Activation')).toBeVisible();
  });

  it('should display spinner when activating license before API responds', async () => {
    createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());

    createBrowserSoapAPIInterceptor('GetAllEffectiveRights', getAllConfigRightsResponseMock());

    const expiredLicenseData = {
      ...mockLicenseData,
      response: {
        ...mockLicenseData.response,
        expired: true,
      },
    };

    await setupSubscriptionTest(<Subscription />, {
      licenseData: expiredLicenseData,
      versionData: mockVersionData,
    });

    await expect.element(page.getByText('Activate')).toBeVisible();

    await new Promise((resolve) => setTimeout(resolve, 150));

    const mockDelayMs = 200;
    const mockResponse = {
      ok: true,
      response: {
        ...mockLicenseData.response,
        expired: false,
        maintenanceStatus: 'active' as const,
      },
    };

    delayedSoapApiForBrowser('activate-license', mockResponse, mockDelayMs);

    const activateButton = page.getByText('Activate');
    await activateButton.click();

    const spinner = page.getByTestId('spinner');
    await expect.element(spinner).toBeVisible();

    await new Promise((resolve) => setTimeout(resolve, mockDelayMs + 50));
  });
});
