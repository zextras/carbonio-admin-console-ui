/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { licenseV1QueryKeys } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { TrialSubscription } from '../trial-subscription';

const createRestLicense = (overrides: Record<string, unknown> = {}) => ({
  licenseType: 'trial',
  status: 'valid',
  companyName: 'Trial End User',
  partner: 'Trial Customer',
  orderId: '8b2458ac-61e5-47c0-b70b-d27701c3c68d',
  carbonioVersion: '24.10.0',
  activationToken: 'TEST_TOKEN',
  startDate: '2026-04-01T00:00:00.000Z',
  endDate: '2026-07-01T00:00:00.000Z',
  totalActiveAccountsNumber: 3,
  lastSyncTime: '2026-06-20T00:00:00.000Z',
  editions: [
    { name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 50 },
    { name: 'Workspace', status: 'green', assignedSeats: 2, totalSeats: 25 },
  ],
  addOns: [{ name: 'ActiveSync', status: 'green', assignedSeats: 2, totalSeats: 50 }],
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

describe('TrialSubscription', () => {
  describe('layout and header', () => {
    it('should render the Subscriptions heading', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText('Subscriptions')).toBeVisible();
    });

    it('should render the row cards and the edition/add-on sections', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Expires on')).toBeVisible();
      await expect.element(page.getByText('Details')).toBeVisible();
      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Add-ons')).toBeVisible();
    });
  });

  describe('TrialBanner', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should render the trial banner with days remaining from the REST end date', async () => {
      vi.useFakeTimers({ now: new Date('2026-06-01T00:00:00Z'), toFake: ['Date'] });
      setupTest(
        <TrialSubscription />,
        createRestLicense({ endDate: '2026-08-01T00:00:00.000Z' }),
      );

      await expect
        .element(page.getByText('Trial active — 61 days remaining'))
        .toBeVisible();
    });

    it('should render the contact provider message', async () => {
      setupTest(<TrialSubscription />);

      await expect
        .element(page.getByText('To upgrade your license, please contact your service provider.'))
        .toBeVisible();
    });

    it('should render the days left badge', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText(/days?\s+left/)).toBeVisible();
    });

    it('should render the ClockOutline icon', async () => {
      const result = await setupTest(<TrialSubscription />);

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
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });

    it('should display ACTIVE text in the badge', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText('ACTIVE', { exact: true }).first()).toBeVisible();
    });

    it('should display the start date with Since prefix', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText(/Since\s+\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });
  });

  describe('Edition and add-on sections', () => {
    it('should render the edition cards from the REST editions', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Workspace', { exact: true })).toBeVisible();
    });

    it('should render the add-on cards from the REST add-ons', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText('Add-ons')).toBeVisible();
      await expect.element(page.getByText('ActiveSync', { exact: true })).toBeVisible();
    });
  });

  describe('SubscriptionExpiry card', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should render the Expires on label', async () => {
      setupTest(<TrialSubscription />);

      await expect.element(page.getByText('Expires on')).toBeVisible();
    });

    it('should display the formatted expiration date', async () => {
      setupTest(
        <TrialSubscription />,
        createRestLicense({ endDate: '2027-03-15T00:00:00.000Z' }),
      );

      await expect.element(page.getByText(/\d{1,2}\s+\w+\s+2027/)).toBeVisible();
    });

    it('should display days remaining text when expiry is within a year', async () => {
      vi.useFakeTimers({ now: new Date('2026-06-01T00:00:00Z'), toFake: ['Date'] });
      setupTest(
        <TrialSubscription />,
        createRestLicense({ endDate: '2026-07-01T00:00:00.000Z' }),
      );

      await expect.element(page.getByText(/In\s+\d+\s+days?/)).toBeVisible();
    });

    it('should display years remaining text when expiry is more than a year away', async () => {
      setupTest(
        <TrialSubscription />,
        createRestLicense({ endDate: '2029-06-18T00:00:00.000Z' }),
      );

      await expect.element(page.getByText(/In\s+more\s+than\s+\d+\s+years?/)).toBeVisible();
    });
  });
});
