/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { RegularSubscription } from '../regular-subscription';

const createMockLicenseData = (overrides: Record<string, unknown> = {}) => ({
  response: {
    subType: 'REGULAR',
    expired: false,
    dateStart: new Date('2022-05-10T00:00:00Z').getTime(),
    dateEnd: new Date('2029-06-18T00:00:00Z').getTime(),
    maintenanceEndDate: new Date('2025-06-18T00:00:00Z').getTime(),
    maintenanceStatus: 'active' as const,
    type: 'Purchased',
    customer: 'Test Customer',
    accountCount: 7,
    licensedUsers: '99',
    notYetValid: false,
    infrastructureId: '8b2458ac-61e5-47c0-b70b-d27701c3c68d',
    authenticationToken: 'TEST_TOKEN',
    endUser: 'Test End User',
    features: [
      { name: 'backup_realtime', quantity: 'unlimited', enabled: true },
      { name: 'files_basic', quantity: 'unlimited', enabled: true },
      { name: 'storages_basic', quantity: 'unlimited', enabled: true },
      { name: 'admins_basic', quantity: 'unlimited', enabled: true },
    ],
  },
  ok: true,
  ...overrides,
});

const setupTest = (
  component: React.ReactElement,
  licenseData?: ReturnType<typeof createMockLicenseData> | null,
) => {
  const queryClient = getQueryClient();

  if (licenseData) {
    queryClient.setQueryData(['subscription', 'license'], licenseData);
  }

  return setupBrowserTest(component, { queryClient });
};

describe('RegularSubscription', () => {
  describe('layout and header', () => {
    it('should render the Subscriptions heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscriptions')).toBeVisible();
    });

    it('should render all four cards in the row', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Seat utilization')).toBeVisible();
      await expect.element(page.getByText('Expires on')).toBeVisible();
    });
  });

  describe('SubscriptionStatus card', () => {
    it('should render the Subscription status label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });

    it('should display ACTIVE text in the badge', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('ACTIVE', { exact: true })).toBeVisible();
    });

    it('should display the start date with Since prefix', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Since\s+\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });

    it('should render without crashing when license data is missing', async () => {
      setupTest(<RegularSubscription />, null);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });
  });

  describe('SubscriptionEdition card', () => {
    it('should render the Active edition label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Active edition')).toBeVisible();
    });

    it('should display EMAIL as the edition text', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('EMAIL')).toBeVisible();
    });

    it('should render a CheckmarkCircle icon', async () => {
      const mockLicenseData = createMockLicenseData();
      const result = await setupTest(<RegularSubscription />, mockLicenseData);

      const container = result.container;
      const icon = container.querySelector('ds-icon[icon="CheckmarkCircle"]');
      expect(icon).not.toBeNull();
    });
  });

  describe('SeatUtilization card', () => {
    it('should render the Seat utilization label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Seat utilization')).toBeVisible();
    });

    it('should display correct usage percentage for low usage', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          accountCount: 7,
          licensedUsers: '99',
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('7%')).toBeVisible();
      await expect.element(page.getByText('LOW USAGE')).toBeVisible();
    });

    it('should display account ratio as used/total', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          accountCount: 7,
          licensedUsers: '99',
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('7/99')).toBeVisible();
    });

    it('should display MODERATE USAGE when usage is between 70% and 95%', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          accountCount: 80,
          licensedUsers: '100',
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('80%')).toBeVisible();
      await expect.element(page.getByText('MODERATE USAGE')).toBeVisible();
    });

    it('should display HIGH USAGE when usage is between 95% and 100%', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          accountCount: 97,
          licensedUsers: '100',
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('97%')).toBeVisible();
      await expect.element(page.getByText('HIGH USAGE')).toBeVisible();
    });

    it('should display FULL USAGE when usage is exactly 100%', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          accountCount: 100,
          licensedUsers: '100',
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('100%')).toBeVisible();
      await expect.element(page.getByText('FULL USAGE')).toBeVisible();
    });

    it('should display OVER USAGE when usage exceeds 100%', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          accountCount: 110,
          licensedUsers: '100',
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('110%')).toBeVisible();
      await expect.element(page.getByText('OVER USAGE')).toBeVisible();
    });

    it('should render ds-tag-icon element in the card', async () => {
      const mockLicenseData = createMockLicenseData();
      const result = await setupTest(<RegularSubscription />, mockLicenseData);

      const container = result.container;
      const tagIcon = container.querySelector('ds-tag-icon');
      expect(tagIcon).not.toBeNull();
    });
  });

  describe('SubscriptionExpiry card', () => {
    it('should render the Expires on label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Expires on')).toBeVisible();
    });

    it('should display the formatted expiration date', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          dateEnd: new Date('2029-06-18T00:00:00Z').getTime(),
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/\d{1,2}\s+\w+\s+2029/)).toBeVisible();
    });

    it('should display days remaining text', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          dateEnd: new Date('2029-06-18T00:00:00Z').getTime(),
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/In\s+\d+\s+days?/)).toBeVisible();
    });
  });
});
