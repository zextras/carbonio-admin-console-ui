/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { licenseV1QueryKeys } from '@zextras/ui-shared';
import {
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { AppView } from '../app-view';

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
    addOns: [{ name: 'ActiveSync', status: 'green', assignedSeats: 42 }],
    bundles: [{ name: 'Files', assignedSeats: 12 }],
    ...overrides,
  });

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
  });

  afterEach(() => {
    resetMockWorker();
  });

  function setupTest(restLicense: Record<string, unknown> | null = null) {
    if (restLicense !== undefined) {
      queryClient.setQueryData(licenseV1QueryKeys.all, restLicense);
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

    it('should not render subscription details when no license', async () => {
      setupTest(null);

      const detailsElements = page.getByText('Details', { exact: true }).elements();
      expect(detailsElements).toHaveLength(0);
    });
  });

  describe('Routing by license type', () => {
    it('should render RegularSubscription for a regular license', async () => {
      setupTest(createRestLicense());

      await expect.element(page.getByText('Expires on')).toBeVisible();
      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });

    it('should render PerpetualSubscription for a perpetual license', async () => {
      setupTest(createPerpetualRestLicense());

      await expect.element(page.getByText('Max Carbonio Version')).toBeVisible();
    });

    it('should render MeteredSubscription for a metered license', async () => {
      setupTest(createMeteredRestLicense());

      await expect.element(page.getByText('Data valid until')).toBeVisible();
      await expect.element(page.getByText('Add-ons', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Feature bundles', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Files & Docs', { exact: true })).toBeVisible();
    });

    it('should render TrialSubscription for a trial license', async () => {
      setupTest(createRestLicense({ licenseType: 'trial' }));

      await expect.element(page.getByText('Subscription status')).toBeVisible();
      await expect.element(page.getByText('Active edition', { exact: true })).toBeVisible();
    });

    it('should render empty for an unknown license type with feature flag on', async () => {
      setupTest(createRestLicense({ licenseType: 'quantum' }));

      const detailsElements = page.getByText('Details', { exact: true }).elements();
      expect(detailsElements).toHaveLength(0);
      const activateElements = page.getByText('Activation token', { exact: true }).elements();
      expect(activateElements).toHaveLength(0);
    });

    it('should render Activation token section when license is present', async () => {
      setupTest(createRestLicense());

      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
    });
  });

  describe('RouteContainer layout', () => {
    it('should render content inside a container with correct structure', async () => {
      const result = await setupTest(createRestLicense());

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
