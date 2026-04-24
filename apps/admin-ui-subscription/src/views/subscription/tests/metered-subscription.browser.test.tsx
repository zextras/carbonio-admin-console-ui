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
    subType: 'METERED',
    expired: false,
    dateStart: new Date('2023-01-15T00:00:00Z').getTime(),
    dateEnd: new Date('2030-12-31T00:00:00Z').getTime(),
    maintenanceStatus: 'active' as const,
    type: 'Metered',
    customer: 'Test Customer',
    accountCount: 10,
    notYetValid: false,
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

describe('MeteredSubscription', () => {
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
      await expect.element(page.getByText('Billing period')).toBeVisible();
      await expect.element(page.getByText('Last time data has been sent')).toBeVisible();
      await expect.element(page.getByText('Data valid until')).toBeVisible();
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

  describe('BillingPeriod card', () => {
    it('should render the Billing period label', async () => {
      const mockLicenseData = createMockLicenseData();
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText('Billing period')).toBeVisible();
    });

    it('should display the formatted next bill date', async () => {
      const renewTimeLeft = 15 * 24 * 60 * 60 * 1000;
      const mockLicenseData = createMockLicenseData({
        response: {
          renewTimeLeft,
          renewDaysLeft: 15,
        },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText(/\d{1,2}\s+\w+\s+\d{4}/)).toBeVisible();
    });

    it('should display the next bill days left text for plural days', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          renewDaysLeft: 15,
          renewTimeLeft: 15 * 24 * 60 * 60 * 1000,
        },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Next bill in \d+ days/)).toBeVisible();
    });

    it('should display the next bill days left text for singular day', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          renewDaysLeft: 1,
          renewTimeLeft: 1 * 24 * 60 * 60 * 1000,
        },
      });
      setupTest(<MeteredSubscription />, mockLicenseData);

      await expect.element(page.getByText(/Next bill in \d+ day/)).toBeVisible();
    });

    it('should render empty date when renewTimeLeft is missing', async () => {
      const mockLicenseData = createMockLicenseData({
        response: {
          renewTimeLeft: undefined,
          renewDaysLeft: undefined,
        },
      });
      const result = await setupTest(<MeteredSubscription />, mockLicenseData);

      const container = result.container;
      const cardTexts = container.querySelectorAll('ds-text');
      const hasEmptyDate = Array.from(cardTexts).some(
        (el) => el.getAttribute('weight') === 'bold' && el.textContent?.trim() === '',
      );
      expect(hasEmptyDate).toBe(true);
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
