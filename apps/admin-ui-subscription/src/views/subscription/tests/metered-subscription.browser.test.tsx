/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { MeteredSubscription } from '../metered-subscription';

const createMockLicenseData = (overrides: Record<string, unknown> = {}) => ({
  response: {
    expired: false,
    dateStart: new Date('2023-01-15T00:00:00Z').getTime(),
    dateEnd: new Date('2030-12-31T00:00:00Z').getTime(),
    type: 'ISP',
    customer: 'Test Customer',
    accountCount: 10,
    licensedUsers: '999999',
    notYetValid: false,
    serverID: 'test-server-id',
    infrastructureId: 'test-infra-id',
    authenticationToken: 'TEST_TOKEN',
    endUser: 'Test End User',
    renewDaysLeft: 15,
    renewTimeLeft: 15 * 24 * 60 * 60 * 1000,
    lastValidationCheck: new Date('2026-04-20T00:00:00Z').getTime(),
    nextValidationDeadline: new Date('2026-05-20T00:00:00Z').getTime(),
    features: [],
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

describe.skip('MeteredSubscription', () => {
  describe('layout and header', () => {
    it('should render the Subscriptions heading', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscriptions')).toBeVisible();
    });

    it('should render all four cards in the row', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Last time data has been sent')).toBeVisible();
      await expect.element(page.getByText('Data valid until')).toBeVisible();
      await expect.element(page.getByText('Total active accounts')).toBeVisible();
    });
  });

  describe('SubscriptionStatus card', () => {
    it('should render the Subscription status label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });

    it('should display ACTIVE text in the badge', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('ACTIVE', { exact: true })).toBeVisible();
    });

    it('should display the start date with Since prefix', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Since\s+\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });

    it('should render without crashing when license data is missing', async () => {
      setupTest(<MeteredSubscription />, null);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
    });
  });

  describe('TotalAccounts card', () => {
    it('should render the Total active accounts label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Total active accounts')).toBeVisible();
    });

    it('should display the licensedUsers count', async () => {
      const mockLicenseData = createMockLicenseData({
        response: { licensedUsers: '500' },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('500')).toBeVisible();
    });

    it('should render without crashing when licensedUsers is missing', async () => {
      const mockLicenseData = createMockLicenseData({
        response: { licensedUsers: undefined },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Total active accounts')).toBeVisible();
    });
  });

  describe('LastDataSent card', () => {
    it('should render the Last time data has been sent label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Last time data has been sent')).toBeVisible();
    });

    it('should display the formatted last validation check date', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          lastValidationCheck: new Date('2026-04-20T00:00:00Z').getTime(),
        },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText(/20\s+\w+\s+2026/)).toBeVisible();
    });

    it('should render without crashing when lastValidationCheck is missing', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          lastValidationCheck: undefined,
        },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Last time data has been sent')).toBeVisible();
    });
  });

  describe('DataValidity card', () => {
    it('should render the Data valid until label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Data valid until')).toBeVisible();
    });

    it('should display the formatted next validation deadline date', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          nextValidationDeadline: new Date('2026-05-20T00:00:00Z').getTime(),
        },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText(/20\s+\w+\s+2026/)).toBeVisible();
    });

    it('should render without crashing when nextValidationDeadline is missing', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          nextValidationDeadline: undefined,
        },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Data valid until')).toBeVisible();
    });
  });
});
