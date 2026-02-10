/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  advancedSupportedApiForBrowser,
  createBrowserSoapAPIInterceptor,
  getAllConfigResponseMock,
  getAllConfigRightsResponseMock,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import AppView from '../app-view';

vi.resetAllMocks();

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);
    grantUserConfigRights();
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('should render BreadCrumb component', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: `/domains_list`,
      queryClient,
    });

    // BreadCrumb should show the home icon
    await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
  });
  it('should render main container structure', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '',
      queryClient,
    });

    // BreadCrumb is rendered
    await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
  });

  it('should render BreadCrumb on different routes', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/different/route',
      queryClient,
    });

    // BreadCrumb should always be visible regardless of route
    await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
  });
  const mockGetDomainResponse = {
    domain: [
      {
        a: [
          { n: 'zimbraSSLCertificate', _content: 'certificate-content' },
          { n: 'zimbraSSLPrivateKey', _content: 'private-key-content' },
        ],
      },
    ],
  };

  it.only('should render global detail panel under the correct route', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    const getInfoInterceptor = createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());

    createBrowserSoapAPIInterceptor('GetDomain', mockGetDomainResponse);
    const getAccountInterceptor = createBrowserSoapAPIInterceptor('GetAccount', {});
    const getAllConfigRightsInterceptor = createBrowserSoapAPIInterceptor(
      'GetAllEffectiveRights',
      getAllConfigRightsResponseMock(),
    );
    const getAllConfigInterceptor = createBrowserSoapAPIInterceptor(
      'GetAllConfig',
      getAllConfigResponseMock({
        carbonioNotificationFrom: 'noreply@example.com',
        carbonioNotificationRecipients: 'admin@example.com',
        zimbraDomainMandatoryMailSignatureEnabled: 'FALSE',
        zimbraAmavisOutboundDisclaimersOnly: 'FALSE',
        carbonioSearchAllDomainsByFeature: 'FALSE',
      }),
    );

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/global/settings/',
      queryClient,
    });

    await getAllConfigInterceptor;
    await advancedSupportedApiForBrowser.withAdvancedSupported();

    await expect.element(page.getByText('Settings', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText('Domain System Notifications', { exact: true }))
      .toBeVisible();
  }, 2_000);
  it('should render GlobalOperations panel under the correct route', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    const getInfoInterceptor = createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());

    createBrowserSoapAPIInterceptor('GetDomain', mockGetDomainResponse);
    const getAccountInterceptor = createBrowserSoapAPIInterceptor('GetAccount', {});
    const getAllConfigRightsInterceptor = createBrowserSoapAPIInterceptor(
      'GetAllEffectiveRights',
      getAllConfigRightsResponseMock(),
    );
    const getAllConfigInterceptor = createBrowserSoapAPIInterceptor(
      'GetAllConfig',
      getAllConfigResponseMock({
        carbonioNotificationFrom: 'noreply@example.com',
        carbonioNotificationRecipients: 'admin@example.com',
        zimbraDomainMandatoryMailSignatureEnabled: 'FALSE',
        zimbraAmavisOutboundDisclaimersOnly: 'FALSE',
        carbonioSearchAllDomainsByFeature: 'FALSE',
      }),
    );

    await setupBrowserTest(
      <>
        <AppView />
      </>,
      {
        initialRouterEntry: '/global/whitelabel_settings',
        queryClient,
      },
    );

    await getAllConfigInterceptor;
    await advancedSupportedApiForBrowser.withAdvancedSupported();

    await expect.element(page.getByText('Settings', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText('Domain System Notifications', { exact: true }))
      .toBeVisible();
  });
});
