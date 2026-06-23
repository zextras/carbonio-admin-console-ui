/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { TrialSubscription } from '../trial-subscription';

const createMockLicenseData = (overrides: Record<string, unknown> = {}) => ({
  response: {
    subType: 'TRIAL',
    expired: false,
    dateStart: new Date('2026-04-01T00:00:00Z').getTime(),
    dateEnd: new Date('2026-07-01T00:00:00Z').getTime(),
    maintenanceEndDate: new Date('2026-07-01T00:00:00Z').getTime(),
    maintenanceStatus: 'active' as const,
    type: 'Trial',
    customer: 'Trial Customer',
    accountCount: 3,
    licensedUsers: '50',
    notYetValid: false,
    infrastructureId: '8b2458ac-61e5-47c0-b70b-d27701c3c68d',
    authenticationToken: 'TEST_TOKEN',
    endUser: 'Trial End User',
    features: [
      { name: 'backup_realtime', quantity: 'unlimited', enabled: true },
      { name: 'files_basic', quantity: 'unlimited', enabled: true },
    ],
    editions: [
      { name: 'email_edition', quantity: '50' },
      { name: 'workspace_edition', quantity: '25' },
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

describe('TrialSubscription', () => {
  describe('layout and header', () => {
    it('should render the Subscriptions heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscriptions')).toBeVisible();
    });

    it('should render the row cards and page sections', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Expires on')).toBeVisible();
      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Add-ons')).toBeVisible();
      await expect.element(page.getByText('Details')).toBeVisible();
    });
  });

  describe('TrialBanner', () => {
    it('should render the trial banner with days remaining', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect
        .element(page.getByText(/Trial active\s+—\s+\d+\s+days?\s+remaining/))
        .toBeVisible();
    });

    it('should render the contact provider message', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect
        .element(page.getByText('To upgrade your license, please contact your service provider.'))
        .toBeVisible();
    });

    it('should render the days left badge', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText(/days?\s+left/)).toBeVisible();
    });

    it('should render the ClockOutline icon', async () => {
      const mockLicenseData = createMockLicenseData();
      const result = await setupTest(<TrialSubscription />, mockLicenseData);

      const icon = result.container.querySelector('ds-icon[icon="ClockOutline"]');
      expect(icon).not.toBeNull();
    });

    it('should render without crashing when license data is missing', async () => {
      setupTest(<TrialSubscription />, null);

      await expect.element(page.getByText(/Trial active/)).toBeVisible();
    });
  });

  describe('SubscriptionStatus card', () => {
    it('should render the Subscription status label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });

    it('should display ACTIVE text in the badge', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('ACTIVE', { exact: true }).first()).toBeVisible();
    });

    it('should display the start date with Since prefix', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Since\s+\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });
  });

  describe('ActiveEdition section', () => {
    it('should render the Active edition heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Active edition')).toBeVisible();
    });

    it('should display Email as the edition text', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
    });

    it('should render an EmailOutline icon', async () => {
      const mockLicenseData = createMockLicenseData();
      const result = await setupTest(<TrialSubscription />, mockLicenseData);

      const icon = result.container.querySelector('ds-icon[icon="EmailOutline"]');
      expect(icon).not.toBeNull();
    });

    it('should render an edition as inactive when email edition has quantity none', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [{ name: 'email_edition', quantity: 'none' }],
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect
        .element(page.getByText(/Upgrade your subscription to unlock/).first())
        .toBeVisible();
    });

    it('should render an edition as inactive when email edition has quantity 0', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [{ name: 'email_edition', quantity: '0' }],
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect
        .element(page.getByText(/Upgrade your subscription to unlock/).first())
        .toBeVisible();
    });

    it('should render editions as inactive when editions are empty', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [],
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect
        .element(page.getByText(/Upgrade your subscription to unlock/).first())
        .toBeVisible();
    });

    it('should display Email when email edition has positive quantity', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [{ name: 'email_edition', quantity: '100' }],
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
    });

    it('should display Workspace as the edition text', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Workspace', { exact: true })).toBeVisible();
    });

    it('should render Workspace as inactive when its quantity is none', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [
            { name: 'email_edition', quantity: '100' },
            { name: 'workspace_edition', quantity: 'none' },
          ],
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Upgrade your subscription to unlock/)).toBeVisible();
    });

    it('should render Workspace as inactive when its quantity is 0', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [
            { name: 'email_edition', quantity: '100' },
            { name: 'workspace_edition', quantity: '0' },
          ],
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Upgrade your subscription to unlock/)).toBeVisible();
    });

    it('should display both Email and Workspace when both editions are active', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          editions: [
            { name: 'email_edition', quantity: '500' },
            { name: 'workspace_edition', quantity: '100' },
          ],
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Workspace', { exact: true })).toBeVisible();
    });
  });

  describe('SubscriptionExpiry card', () => {
    it('should render the Expires on label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText('Expires on')).toBeVisible();
    });

    it('should display the formatted expiration date', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          dateEnd: new Date('2027-03-15T00:00:00Z').getTime(),
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText(/\d{1,2}\s+\w+\s+2027/)).toBeVisible();
    });

    it('should display days remaining text when expiry is within a year', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          dateEnd: new Date('2026-07-01T00:00:00Z').getTime(),
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText(/In\s+\d+\s+days?/)).toBeVisible();
    });

    it('should display years remaining text when expiry is more than a year away', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          dateEnd: new Date('2029-06-18T00:00:00Z').getTime(),
        },
      });
      setupTest(<TrialSubscription />, mockLicenseData);

      await expect.element(page.getByText(/In\s+more\s+than\s+\d+\s+years?/)).toBeVisible();
    });
  });
});
