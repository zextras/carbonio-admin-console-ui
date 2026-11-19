/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { licenseV1QueryKeys, useLoginConfigStore } from '@zextras/ui-shared';
import {
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { AppView } from '../app-view';

// SOAP license: feeds the pages that still host SOAP cards (legacy page,
// MaxVersion, metered cards, trial banner)
const createSoapLicenseData = (responseOverrides: Record<string, unknown> = {}) => ({
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
    maxCarbonioVersion: '23.12.0',
    ...responseOverrides,
  },
});

// REST license: drives the routing and every page already migrated to /license/v1/info
const createRestLicense = (overrides: Record<string, unknown> = {}) => ({
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
  addOns: [],
  ...overrides,
});

const createPerpetualRestLicense = (overrides: Record<string, unknown> = {}) =>
  createRestLicense({
    licenseType: 'perpetual',
    maxCarbonioVersion: '23.12.0',
    maintenanceEndDate: '2025-06-18T00:00:00.000Z',
    maintenanceStatus: 'active',
    ...overrides,
  });

const createMeteredRestLicense = (overrides: Record<string, unknown> = {}) =>
  createRestLicense({
    licenseType: 'metered',
    editions: undefined,
    lastValidationCheck: '2026-04-20T00:00:00.000Z',
    nextValidationDeadline: '2026-05-20T00:00:00.000Z',
    renewTimeLeft: 15 * 24 * 60 * 60 * 1000,
    maxTotalSeats: 500,
    addOns: [],
    bundles: [{ name: 'Files', assignedSeats: 12 }],
    ...overrides,
  });

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    useLoginConfigStore.setState({ featureFlags: null });
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
  });

  afterEach(() => {
    resetMockWorker();
  });

  /**
   * Seeds the REST license cache (routing + migrated pages). Passing `undefined`
   * leaves the cache empty so the query fetches and fails (no valid license data).
   * The optional SOAP license feeds pages that still host SOAP cards.
   */
  function setupTest(
    restLicense: Record<string, unknown> | null = null,
    soapLicense?: Record<string, unknown>,
  ) {
    if (restLicense !== undefined) {
      queryClient.setQueryData(licenseV1QueryKeys.all, restLicense);
    }
    if (soapLicense) {
      queryClient.setQueryData(['subscription', 'license'], soapLicense);
    }

    return setupBrowserTest(<AppView />, { queryClient });
  }

  describe('Breadcrumb', () => {
    it('should always render the breadcrumb', async () => {
      setupTest();

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
    });
  });

  describe('No license', () => {
    it('should render ActivateSubscription when the REST license data is null', async () => {
      setupTest(null);

      await expect.element(page.getByText('Insert here the activation token')).toBeVisible();
    });

    it('should render ActivateSubscription when the REST license request fails', async () => {
      setupTest(undefined);

      await expect.element(page.getByText('Insert here the activation token')).toBeVisible();
    });

    it('should not render legacy Subscription when no license', async () => {
      setupTest(null);

      const detailsElements = page.getByText('Details', { exact: true }).elements();
      expect(detailsElements).toHaveLength(0);
    });
  });

  describe('Feature flag off (default)', () => {
    it('should render legacy Subscription component when feature flag is false', async () => {
      useLoginConfigStore.setState({
        featureFlags: { enforceSubscriptionRequirements: false },
      });
      setupTest(createRestLicense(), createSoapLicenseData());

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render legacy Subscription for a perpetual license with feature flag off', async () => {
      useLoginConfigStore.setState({
        featureFlags: { enforceSubscriptionRequirements: false },
      });
      setupTest(
        createPerpetualRestLicense(),
        createSoapLicenseData({ response: { subType: 'PERPETUAL', maxCarbonioVersion: '23.12.0' } }),
      );

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render legacy Subscription for an ISP license with feature flag off', async () => {
      useLoginConfigStore.setState({
        featureFlags: { enforceSubscriptionRequirements: false },
      });
      setupTest(
        createMeteredRestLicense({ licenseType: 'isp' }),
        createSoapLicenseData({ response: { type: 'ISP' } }),
      );

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render legacy Subscription for a trial license with feature flag off', async () => {
      useLoginConfigStore.setState({
        featureFlags: { enforceSubscriptionRequirements: false },
      });
      setupTest(
        createRestLicense({ licenseType: 'trial' }),
        createSoapLicenseData({ response: { subType: 'TRIAL', type: 'Trial' } }),
      );

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should not render new subscription components when feature flag is off', async () => {
      useLoginConfigStore.setState({
        featureFlags: { enforceSubscriptionRequirements: false },
      });
      setupTest(createRestLicense(), createSoapLicenseData());

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
      const expiresOnElements = page.getByText('Expires on').elements();
      expect(expiresOnElements).toHaveLength(0);
    });
  });

  describe('Feature flag on', () => {
    beforeEach(() => {
      useLoginConfigStore.setState({
        featureFlags: { enforceSubscriptionRequirements: true },
      });
    });

    it('should render RegularSubscription for a regular license', async () => {
      setupTest(createRestLicense());

      await expect.element(page.getByText('Expires on')).toBeVisible();
      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });

    it('should render PerpetualSubscription for a perpetual license', async () => {
      setupTest(
        createPerpetualRestLicense(),
        createSoapLicenseData({ response: { subType: 'PERPETUAL', maxCarbonioVersion: '23.12.0' } }),
      );

      await expect.element(page.getByText('Max Carbonio Version')).toBeVisible();
    });

    it('should render MeteredSubscription for a metered license', async () => {
      setupTest(
        createMeteredRestLicense(),
        createSoapLicenseData({
          response: {
            subType: 'METERED',
            renewDaysLeft: 15,
            renewTimeLeft: 15 * 24 * 60 * 60 * 1000,
            lastValidationCheck: new Date('2026-04-20T00:00:00Z').getTime(),
            nextValidationDeadline: new Date('2026-05-20T00:00:00Z').getTime(),
          },
        }),
      );

      await expect.element(page.getByText('Data valid until')).toBeVisible();
    });

    it('should render TrialSubscription for a trial license', async () => {
      setupTest(
        createRestLicense({ licenseType: 'trial' }),
        createSoapLicenseData({
          response: { subType: 'TRIAL', type: 'Trial', dateEnd: new Date('2029-06-18T00:00:00Z').getTime() },
        }),
      );

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      // Editions render only for the regular license type
      expect(page.getByText('Active edition', { exact: true }).elements()).toHaveLength(0);
    });

    it('should render empty for an unknown license type with feature flag on', async () => {
      setupTest(createRestLicense({ licenseType: 'quantum' }));

      const detailsElements = page.getByText('Details', { exact: true }).elements();
      expect(detailsElements).toHaveLength(0);
      const activateElements = page.getByText('Activation token', { exact: true }).elements();
      expect(activateElements).toHaveLength(0);
    });

    it('should render Activation token section when license is present and feature flag is on', async () => {
      setupTest(createRestLicense());

      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });

    it('should not render legacy Subscription when feature flag is on and type matches', async () => {
      setupTest(createRestLicense());

      await expect.element(page.getByText('Active edition', { exact: true })).toBeVisible();
    });
  });

  describe('Feature flag initialization', () => {
    it('should default to legacy Subscription when feature flag is unset', async () => {
      setupTest(createRestLicense(), createSoapLicenseData());

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });
  });

  describe('RouteContainer layout', () => {
    it('should render content inside a container with correct structure', async () => {
      const result = await setupTest(createRestLicense(), createSoapLicenseData());

      const outerDiv = result.container.firstChild as HTMLElement;
      expect(outerDiv).not.toBeNull();
    });

    it('should render Breadcrumb and subscription view together', async () => {
      setupTest(null);

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Insert here the activation token')).toBeVisible();
    });
  });
});
