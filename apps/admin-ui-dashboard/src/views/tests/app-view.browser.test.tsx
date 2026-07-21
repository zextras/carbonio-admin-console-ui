/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  advancedSupportedApiForBrowser,
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  LocationDisplay,
  registerAppRoute,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ACCOUNTS, DASHBOARD, DISTRIBUTION_LIST, DOMAINS_ROUTE_ID } from '../../constants';
import { AppView } from '../app-view';

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
  });

  async function setupAppViewTest(initialRoute?: string, extra?: ReactElement) {
    // Register peer-app routes so buildPath() resolves prefixed paths.
    registerAppRoute(DOMAINS_ROUTE_ID, 'manage');
    registerAppRoute('storage', 'manage');
    registerAppRoute('notifications', 'logandqueues');

    // Setup API interceptors
    const getInfoInterceptor = createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
    createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
      grantee: { id: 'test-id', name: 'admin@test.com' },
      target: [],
    });
    createBrowserSoapAPIInterceptor('GetAllServers', {
      server: [
        {
          id: 'server-1',
          name: 'mailstore1.test.com',
          a: [
            { n: 'zimbraServiceHostname', _content: 'mailstore1.test.com' },
            { n: 'description', _content: 'Primary mailstore' },
          ],
        },
      ],
    });
    // useDomainInformation reads `response.domain[0]`, so the mock must return an array.
    createBrowserSoapAPIInterceptor('GetDomain', {
      domain: [
        {
          id: 'domain-1',
          name: 'example.com',
          a: [{ n: 'zimbraDomainName', _content: 'example.com' }],
        },
      ],
    });
    createBrowserSoapAPIInterceptor('GetVersionInfo', {
      info: { majorversion: '24', minorversion: '5', microversion: '0' },
    });
    createBrowserSoapAPIInterceptor('SearchDirectory', {});

    await setupBrowserTest(
      <>
        <AppView />
        {extra}
      </>,
      {
        initialRouterEntry: initialRoute || `/${DASHBOARD}`,
        queryClient,
      },
    );

    await getInfoInterceptor;
  }

  it('renders BreadCrumb', async () => {
    await setupAppViewTest();
    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('renders Welcome section with username', async () => {
    await setupAppViewTest();
    await expect.element(page.getByText(/Welcome/i)).toBeVisible();
    await expect.element(page.getByText('test')).toBeVisible();
  });

  it('renders Quick Access section with all elements', async () => {
    await setupAppViewTest();
    // Section title and icon
    await expect.element(page.getByText(/Quick Access/i)).toBeVisible();
    await expect.element(page.getByTestId('icon: FlashOutline')).toBeVisible();

    // Accounts card
    await expect.element(page.getByText(/Accounts/i)).toBeVisible();
    await expect.element(page.getByTestId('icon: PersonOutline')).toBeVisible();

    // Distribution List card
    await expect.element(page.getByText(/Distribution List/i)).toBeVisible();
    await expect.element(page.getByTestId('icon: DistributionListOutline')).toBeVisible();

    // Domain labels (at least 1)
    const domainsElements = page.getByText(/Domains/i).all();
    expect(domainsElements.length).toBeGreaterThanOrEqual(1);

    // Open labels and chevron icons (at least 2 each)
    const openElements = page.getByText(/^Open$/i).all();
    expect(openElements.length).toBeGreaterThanOrEqual(2);

    const chevronIcons = page.getByTestId('icon: ChevronRightOutline').all();
    expect(chevronIcons.length).toBeGreaterThanOrEqual(2);
  });

  async function setupAdvancedTest() {
    await advancedSupportedApiForBrowser.withAdvancedSupported();

    // Grant server rights
    queryClient.setQueryData(
      ['effective-rights', 'test@example.com'],
      [
        {
          type: 'config',
          all: [{ setAttrs: [{ all: true }], getAttrs: [{ all: true }] }],
        },
        {
          type: 'server',
          all: [{ right: [{ n: 'listServer' }] }],
        },
      ],
    );

    await setupAppViewTest();
  }

  describe('Advanced mode sections', () => {
    it('renders Notifications section with all elements', async () => {
      await setupAdvancedTest();

      // Bell icon and title
      await expect.element(page.getByTestId('icon: BellOutline')).toBeVisible();
      await expect.element(page.getByText(/Your Notifications/i)).toBeVisible();

      // Go to notification button
      await expect.element(page.getByText(/Go to notification/i)).toBeVisible();

      // Notification tabs
      await expect.element(page.getByText(/ALL/i)).toBeVisible();
      await expect.element(page.getByText(/INFORMATION/i)).toBeVisible();
      await expect.element(page.getByText(/WARNING/i)).toBeVisible();
      await expect.element(page.getByText(/ERROR/i)).toBeVisible();

      // Table headers
      await expect.element(page.getByText(/Server/i)).toBeVisible();
      await expect.element(page.getByText(/Date/i)).toBeVisible();
      await expect.element(page.getByText(/Type/i)).toBeVisible();
    });
  });

  describe('navigation', () => {
    it('navigates to the domain accounts route when the Accounts quick access is opened', async () => {
      await setupAppViewTest(undefined, <LocationDisplay />);

      // Wait for the domain info to load (Quick Access shows the domain name).
      await expect.element(page.getByText(/Quick Access to example\.com/i)).toBeVisible();

      await page.getByText('Open').first().click();

      await expect
        .element(page.getByTestId('location'))
        .toHaveTextContent(`/manage/${DOMAINS_ROUTE_ID}/domain-1/${ACCOUNTS}`);
    });

    it('navigates to the distribution list route when the Distribution List quick access is opened', async () => {
      await setupAppViewTest(undefined, <LocationDisplay />);

      await expect.element(page.getByText(/Quick Access to example\.com/i)).toBeVisible();

      await page.getByText('Open').nth(1).click();

      await expect
        .element(page.getByTestId('location'))
        .toHaveTextContent(`/manage/${DOMAINS_ROUTE_ID}/domain-1/${DISTRIBUTION_LIST}`);
    });
  });
});
