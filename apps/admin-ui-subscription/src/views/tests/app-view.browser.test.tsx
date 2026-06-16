/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { AppView } from '../app-view';

const createMockLicenseData = (overrides: Record<string, unknown> = {}) => ({
  ok: true,
  response: {
    type: 'Purchased',
    subType: 'REGULAR',
    expired: false,
    dateStart: new Date('2022-05-10T00:00:00Z').getTime(),
    dateEnd: new Date('2029-06-18T00:00:00Z').getTime(),
    maintenanceEndDate: new Date('2025-06-18T00:00:00Z').getTime(),
    maintenanceStatus: 'active' as const,
    customer: 'Test Customer',
    accountCount: 7,
    licensedUsers: '99',
    notYetValid: false,
    infrastructureId: '8b2458ac-61e5-47c0-b70b-d27701c3c68d',
    authenticationToken: 'TEST_TOKEN',
    endUser: 'Test End User',
    features: [],
  },
  ...overrides,
});

const localStorageStore: Record<string, string> = {};

function mockLocalStorage() {
  (globalThis.localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(
    (key: string) => localStorageStore[key] ?? null,
  );
  (globalThis.localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(
    (key: string, value: string) => {
      localStorageStore[key] = String(value);
    },
  );
  (globalThis.localStorage.removeItem as ReturnType<typeof vi.fn>).mockImplementation(
    (key: string) => {
      delete localStorageStore[key];
    },
  );
}

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    mockLocalStorage();
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
  });

  afterEach(() => {
    resetMockWorker();
  });

  function setupTest(licenseData?: Record<string, unknown> | null) {
    if (licenseData !== undefined) {
      queryClient.setQueryData(['subscription', 'license'], licenseData);
    }

    return setupBrowserTest(<AppView />, { queryClient });
  }

  describe('Breadcrumb', () => {
    it('should always render the breadcrumb', async () => {
      setupTest(null);

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
    });
  });

  describe('No license (subscriptionType is null)', () => {
    it('should render ActivateSubscription when license data is null', async () => {
      setupTest(null);

      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });

    it('should render ActivateSubscription when license type is None', async () => {
      const noneLicense = { ok: true, response: { type: 'None', features: [] } };
      setupTest(noneLicense as Record<string, unknown>);

      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });

    it('should not render legacy Subscription when no license', async () => {
      setupTest(null);

      const detailsElements = page.getByText('Details', { exact: true }).elements();
      expect(detailsElements).toHaveLength(0);
    });
  });

  describe('Feature flag off (default)', () => {
    it('should render legacy Subscription component when feature flag is false', async () => {
      localStorageStore['new_subscription_feature_flag'] = 'false';
      const licenseData = createMockLicenseData();
      setupTest(licenseData);

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render legacy Subscription for Purchased + PERPETUAL with feature flag off', async () => {
      localStorageStore['new_subscription_feature_flag'] = 'false';
      const licenseData = createMockLicenseData({
        response: { type: 'Purchased', subType: 'PERPETUAL' },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render legacy Subscription for ISP license with feature flag off', async () => {
      localStorageStore['new_subscription_feature_flag'] = 'false';
      const licenseData = createMockLicenseData({
        response: { type: 'ISP' },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render legacy Subscription for Purchased + TRIAL with feature flag off', async () => {
      localStorageStore['new_subscription_feature_flag'] = 'false';
      const licenseData = createMockLicenseData({
        response: { type: 'Purchased', subType: 'TRIAL' },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should not render new subscription components when feature flag is off', async () => {
      localStorageStore['new_subscription_feature_flag'] = 'false';
      const licenseData = createMockLicenseData({
        response: { type: 'Purchased', subType: 'REGULAR' },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
      const expiresOnElements = page.getByText('Expires on').elements();
      expect(expiresOnElements).toHaveLength(0);
    });
  });

  describe('Feature flag on', () => {
    beforeEach(() => {
      localStorageStore['new_subscription_feature_flag'] = 'true';
    });

    it('should render RegularSubscription for Purchased + REGULAR', async () => {
      const licenseData = createMockLicenseData({
        response: { type: 'Purchased', subType: 'REGULAR' },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Expires on')).toBeVisible();
      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });

    it('should render PerpetualSubscription for Purchased + PERPETUAL', async () => {
      const licenseData = createMockLicenseData({
        response: { type: 'Purchased', subType: 'PERPETUAL' },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Max Carbonio version')).toBeVisible();
    });

    it('should render MeteredSubscription for ISP type', async () => {
      const licenseData = createMockLicenseData({
        response: {
          type: 'ISP',
          renewDaysLeft: 15,
          renewTimeLeft: 15 * 24 * 60 * 60 * 1000,
          lastValidationCheck: new Date('2026-04-20T00:00:00Z').getTime(),
          nextValidationDeadline: new Date('2026-05-20T00:00:00Z').getTime(),
        },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Data valid until')).toBeVisible();
    });

    it('should render TrialSubscription for Purchased + TRIAL', async () => {
      const licenseData = createMockLicenseData({
        response: {
          type: 'Purchased',
          subType: 'TRIAL',
          dateEnd: new Date('2029-06-18T00:00:00Z').getTime(),
        },
      });
      setupTest(licenseData);

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Active edition')).toBeVisible();
      await expect.element(page.getByText('Seat utilization')).toBeVisible();
    });

    it('should render empty for unknown type with feature flag on', async () => {
      const licenseData = createMockLicenseData({
        response: { type: 'Unknown' },
      });
      setupTest(licenseData);

      const detailsElements = page.getByText('Details', { exact: true }).elements();
      expect(detailsElements).toHaveLength(0);
      const activateElements = page.getByText('Activation token', { exact: true }).elements();
      expect(activateElements).toHaveLength(0);
    });

    it('should render Activation token section when license is present and feature flag is on', async () => {
      const licenseData = createMockLicenseData();
      setupTest(licenseData);

      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });

    it('should not render legacy Subscription when feature flag is on and type matches', async () => {
      const licenseData = createMockLicenseData({
        response: { type: 'Purchased', subType: 'REGULAR' },
      });
      setupTest(licenseData);

      const detailsElements = page.getByText('Details', { exact: true }).elements();
      expect(detailsElements).toHaveLength(0);
    });
  });

  describe('Feature flag initialization', () => {
    it('should default to legacy Subscription when feature flag is unset', async () => {
      const licenseData = createMockLicenseData();
      setupTest(licenseData);

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });
  });

  describe('RouteContainer layout', () => {
    it('should render content inside a container with correct structure', async () => {
      const licenseData = createMockLicenseData();
      const result = await setupTest(licenseData);

      const outerDiv = result.container.firstChild as HTMLElement;
      expect(outerDiv).not.toBeNull();
      expect(outerDiv.style.height).toBe('fit-content');
      expect(outerDiv.style.width).toBe('100%');
    });

    it('should render Breadcrumb and subscription view together', async () => {
      setupTest(null);

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });
  });
});
