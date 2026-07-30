/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    carbonioVersion: '24.10.0',
    updateTime: new Date('2026-06-20T00:00:00Z').getTime(),
    endUser: 'Test End User',
    features: [
      { name: 'backup_realtime', quantity: 'unlimited', enabled: true },
      { name: 'files_basic', quantity: 'unlimited', enabled: true },
      { name: 'storages_basic', quantity: 'unlimited', enabled: true },
      { name: 'admins_basic', quantity: 'unlimited', enabled: true },
    ],
    editions: [
      { name: 'email_edition', quantity: '500' },
      { name: 'workspace_edition', quantity: '100' },
      { name: 'activesync_addon', quantity: '100' },
      { name: 'replica_addon', quantity: '0' },
    ],
    ...(overrides.response as Record<string, unknown>),
  },
  ok: true,
  ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== 'response')),
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

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
    });

    it('should render the Update data button', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Update data')).toBeVisible();
    });

    it('should render the last sync time when present', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Last sync\s+\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });

    it('should render every section of the page', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Expires on')).toBeVisible();
      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Add-ons')).toBeVisible();
      await expect.element(page.getByText('Details')).toBeVisible();
      await expect.element(page.getByText('Activation token')).toBeVisible();
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

      await expect.element(page.getByText('ACTIVE', { exact: true }).first()).toBeVisible();
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

  describe('SubscriptionExpiry card', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

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

    it('should display days remaining text when expiry is within a year', async () => {
      vi.useFakeTimers({ now: new Date('2026-06-01T00:00:00Z'), toFake: ['Date'] });
      const mockLicenseData = createMockLicenseData({
        response: {
          dateEnd: new Date('2026-07-01T00:00:00Z').getTime(),
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/In\s+\d+\s+days?/)).toBeVisible();
    });

    it('should display years remaining text when expiry is more than a year away', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          dateEnd: new Date('2029-06-18T00:00:00Z').getTime(),
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/In\s+more\s+than\s+\d+\s+years?/)).toBeVisible();
    });
  });

  describe('ActiveEdition section', () => {
    it('should render the Active edition heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Active edition')).toBeVisible();
    });

    it('should render the Email and Workspace editions as active', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Workspace', { exact: true })).toBeVisible();
    });

    it('should render a CheckmarkCircle icon for active editions', async () => {
      const mockLicenseData = createMockLicenseData();
      const result = await setupTest(<RegularSubscription />, mockLicenseData);

      const icon = result.container.querySelector('ds-icon[icon="EmailOutline"]');
      expect(icon).not.toBeNull();
    });

    it('should render an edition as inactive when its quantity is 0', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [
            { name: 'email_edition', quantity: '500' },
            { name: 'workspace_edition', quantity: '0' },
          ],
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Upgrade your subscription to unlock/)).toBeVisible();
    });

    it('should render an edition as inactive when it is absent from the license', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [{ name: 'email_edition', quantity: '500' }],
        },
      });
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Upgrade your subscription to unlock/)).toBeVisible();
    });
  });

  describe('Add-ons section', () => {
    it('should render the Add-ons heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Add-ons')).toBeVisible();
    });

    it('should render the ActiveSync and UserReplica add-on labels', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('ActiveSync', { exact: true })).toBeVisible();
      await expect.element(page.getByText('UserReplica', { exact: true })).toBeVisible();
    });
  });

  describe('Details section', () => {
    it('should render the Details heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Details')).toBeVisible();
    });

    it('should display the company name, partner and order id', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Test End User')).toBeVisible();
      await expect.element(page.getByText('Test Customer')).toBeVisible();
      await expect.element(page.getByText('8b2458ac-61e5-47c0-b70b-d27701c3c68d')).toBeVisible();
    });

    it('should display the formatted subscription type', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Regular', { exact: true })).toBeVisible();
    });
  });

  describe('ActivationToken section', () => {
    it('should render the Activation token heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Activation token')).toBeVisible();
    });

    it('should render the Show token control when a token is present', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<RegularSubscription />, mockLicenseData);

      await expect.element(page.getByText('Show token')).toBeVisible();
    });
  });
});
