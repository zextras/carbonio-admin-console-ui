/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { licenseV1QueryKeys } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { RegularSubscription } from '../regular-subscription';

const createMockLicense = (overrides: Record<string, unknown> = {}) => ({
  licenseType: 'regular',
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

const setupTest = (component: React.ReactElement, license?: Record<string, unknown> | null) => {
  const queryClient = getQueryClient();

  // Seeding the cache (license value or null for "no license") avoids any network fetch
  queryClient.setQueryData(licenseV1QueryKeys.all, license ?? null);

  return setupBrowserTest(component, { queryClient });
};

describe('RegularSubscription', () => {
  describe('layout and header', () => {
    it('should render the Subscriptions heading', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
    });

    it('should render the Update data button', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Update data')).toBeVisible();
    });

    it('should render the last sync time when present', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText(/Last sync\s+\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });

    it('should hide the last sync time when no sync time is recorded', async () => {
      setupTest(<RegularSubscription />, createMockLicense({ lastSyncTime: null }));

      expect(page.getByText(/Last sync/).elements()).toHaveLength(0);
    });

    it('should render every section of the page', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

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
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });

    it('should display ACTIVE text in the badge', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('ACTIVE', { exact: true }).first()).toBeVisible();
    });

    it('should display the start date with Since prefix', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

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
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Expires on')).toBeVisible();
    });

    it('should display the formatted expiration date', async () => {
      setupTest(
        <RegularSubscription />,
        createMockLicense({ endDate: '2029-06-18T00:00:00.000Z' }),
      );

      await expect.element(page.getByText(/\d{1,2}\s+\w+\s+2029/)).toBeVisible();
    });

    it('should display days remaining text when expiry is within a year', async () => {
      vi.useFakeTimers({ now: new Date('2026-06-01T00:00:00Z'), toFake: ['Date'] });
      setupTest(
        <RegularSubscription />,
        createMockLicense({ endDate: '2026-07-01T00:00:00.000Z' }),
      );

      await expect.element(page.getByText(/In\s+\d+\s+days?/)).toBeVisible();
    });

    it('should display years remaining text when expiry is more than a year away', async () => {
      setupTest(
        <RegularSubscription />,
        createMockLicense({ endDate: '2029-06-18T00:00:00.000Z' }),
      );

      await expect.element(page.getByText(/In\s+more\s+than\s+\d+\s+years?/)).toBeVisible();
    });
  });

  describe('ActiveEdition section', () => {
    it('should render the Active edition heading', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Active edition')).toBeVisible();
    });

    it('should render the Email and Workspace editions as active', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Workspace', { exact: true })).toBeVisible();
    });

    it('should render the total seats of each edition verbatim', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('500', { exact: true })).toBeVisible();
      await expect.element(page.getByText('100', { exact: true }).first()).toBeVisible();
    });

    it('should render an edition as inactive when its totalSeats is 0', async () => {
      setupTest(
        <RegularSubscription />,
        createMockLicense({
          editions: [
            { name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 500 },
            { name: 'Workspace', status: 'not active', assignedSeats: 0, totalSeats: 0 },
          ],
        }),
      );

      await expect.element(page.getByText(/Upgrade your subscription to unlock/)).toBeVisible();
    });

    it('should render an edition as inactive when it is absent from the license', async () => {
      setupTest(
        <RegularSubscription />,
        createMockLicense({
          editions: [{ name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 500 }],
        }),
      );

      await expect.element(page.getByText(/Upgrade your subscription to unlock/)).toBeVisible();
    });
  });

  describe('Add-ons section', () => {
    it('should render the Add-ons heading', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Add-ons')).toBeVisible();
    });

    it('should render the ActiveSync and UserReplica add-on labels', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('ActiveSync', { exact: true })).toBeVisible();
      await expect.element(page.getByText('UserReplica', { exact: true })).toBeVisible();
    });

    it('should render only active add-ons with seat counts', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('100', { exact: true }).first()).toBeVisible();
    });
  });

  describe('Details section', () => {
    it('should render the Details heading', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Details')).toBeVisible();
    });

    it('should display the company name, partner and order id', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Test End User')).toBeVisible();
      await expect.element(page.getByText('Test Customer')).toBeVisible();
      await expect.element(page.getByText('8b2458ac-61e5-47c0-b70b-d27701c3c68d')).toBeVisible();
    });

    it('should display the total active accounts count', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('7', { exact: true })).toBeVisible();
    });

    it('should display the formatted subscription type', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Regular', { exact: true })).toBeVisible();
    });
  });

  describe('ActivationToken section', () => {
    it('should render the Activation token heading', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Activation token')).toBeVisible();
    });

    it('should render the Show token control when a token is present', async () => {
      setupTest(<RegularSubscription />, createMockLicense());

      await expect.element(page.getByText('Show token')).toBeVisible();
    });
  });
});
