/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { licenseV1QueryKeys } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { PerpetualSubscription } from '../perpetual-subscription';

const createRestLicense = (overrides: Record<string, unknown> = {}) => ({
  licenseType: 'perpetual',
  status: 'valid',
  companyName: 'Test End User',
  partner: 'Test Customer',
  orderId: '8b2458ac-61e5-47c0-b70b-d27701c3c68d',
  carbonioVersion: '24.10.0',
  activationToken: 'TEST_TOKEN',
  startDate: '2022-05-10T00:00:00.000Z',
  endDate: '2029-06-18T00:00:00.000Z',
  totalActiveAccountsNumber: 7,
  lastSyncTime: '2026-06-20T00:00:00.000Z',
  maxCarbonioVersion: '23.12.0',
  maintenanceEndDate: '2025-06-18T00:00:00.000Z',
  maintenanceStatus: 'active',
  editions: [
    { name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 500 },
    { name: 'Workspace', status: 'green', assignedSeats: 10, totalSeats: 100 },
  ],
  addOns: [
    { name: 'ActiveSync', status: 'green', assignedSeats: 10, totalSeats: 100 },
    { name: 'MailReplica', status: 'not active', assignedSeats: 0, totalSeats: 0 },
  ],
  ...overrides,
});

const setupTest = (
  component: React.ReactElement,
  restLicense?: ReturnType<typeof createRestLicense> | null,
) => {
  const queryClient = getQueryClient();

  if (restLicense !== null) {
    queryClient.setQueryData(licenseV1QueryKeys.all, restLicense ?? createRestLicense());
  }

  return setupBrowserTest(component, { queryClient });
};

describe('PerpetualSubscription', () => {
  describe('layout and header', () => {
    it('should render the Subscriptions heading', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
    });

    it('should render every section of the page', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Max Carbonio Version')).toBeVisible();
      await expect.element(page.getByText('Details')).toBeVisible();
      await expect.element(page.getByText('Activation token')).toBeVisible();
      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Add-ons')).toBeVisible();
    });

    it('should not render the Update data button', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();

      expect(await page.getByRole('button', { name: 'Update data' }).elements()).toHaveLength(0);
    });

    it('should render the last sync time when present', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText(/Last sync\s+\d{1,2}\s+\w+\s+\d{4}\s+\d{2}:\d{2}/)).toBeVisible();
    });

    it('should not render the last sync time when lastSyncTime is null', async () => {
      setupTest(
        <PerpetualSubscription />,
        createRestLicense({ lastSyncTime: null }),
      );

      expect(await page.getByText('Last sync').elements()).toHaveLength(0);
    });
  });

  describe('SubscriptionStatus card', () => {
    it('should render the Subscription status label', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });

    it('should display ACTIVE text in the badge', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('ACTIVE', { exact: true }).first()).toBeVisible();
    });

    it('should display the start date with Since prefix', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText(/Since\s+\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });

    it('should render without crashing when license data is missing', async () => {
      setupTest(<PerpetualSubscription />, null);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });
  });

  describe('MaxVersion card', () => {
    it('should render the Max Carbonio Version label', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Max Carbonio Version')).toBeVisible();
    });

    it('should display the maxCarbonioVersion value from the REST license', async () => {
      setupTest(<PerpetualSubscription />, createRestLicense({ maxCarbonioVersion: '25.1.0' }));

      await expect.element(page.getByText('25.1.0')).toBeVisible();
    });

    it('should render without crashing when maxCarbonioVersion is missing', async () => {
      setupTest(<PerpetualSubscription />, createRestLicense({ maxCarbonioVersion: undefined }));

      await expect.element(page.getByText('Max Carbonio Version')).toBeVisible();
    });
  });

  describe('Edition and add-on sections', () => {
    it('should render the edition cards from the REST editions', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Workspace', { exact: true })).toBeVisible();
    });

    it('should render the add-on cards from the REST add-ons', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Add-ons')).toBeVisible();
      await expect.element(page.getByText('ActiveSync', { exact: true })).toBeVisible();
      await expect.element(page.getByText('UserReplica', { exact: true })).toBeVisible();
    });
  });

  describe('Details section', () => {
    it('should render the Details heading', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Details')).toBeVisible();
    });

    it('should display the company name, partner and order id', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Test End User')).toBeVisible();
      await expect.element(page.getByText('Test Customer')).toBeVisible();
      await expect.element(page.getByText('8b2458ac-61e5-47c0-b70b-d27701c3c68d')).toBeVisible();
    });

    it('should display the formatted subscription type', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Perpetual', { exact: true })).toBeVisible();
    });

    it('should display the module version', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('24.10.0')).toBeVisible();
    });

    it('should display the maintenance expiration date for perpetual licenses', async () => {
      setupTest(
        <PerpetualSubscription />,
        createRestLicense({ maintenanceEndDate: '2025-06-18T00:00:00.000Z' }),
      );

      await expect.element(page.getByText('Maintenance expiration date')).toBeVisible();
      await expect.element(page.getByText(/18\s+\w+\s+2025/)).toBeVisible();
    });

    it('should not display the maintenance expiration date when maintenanceEndDate is missing', async () => {
      setupTest(
        <PerpetualSubscription />,
        createRestLicense({ maintenanceEndDate: undefined }),
      );

      await expect
        .element(page.getByText('Maintenance expiration date'))
        .not.toBeInTheDocument();
    });
  });

  describe('ActivationToken section', () => {
    it('should render the Activation token heading', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Activation token')).toBeVisible();
    });

    it('should render the Show token control when a token is present', async () => {
      setupTest(<PerpetualSubscription />);

      await expect.element(page.getByText('Show token')).toBeVisible();
    });
  });
});
