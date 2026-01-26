/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { useCosStore } from '../../store/cos/store';
import AppView from '../app-view';

afterEach(() => {
  resetMockWorker();
  useCosStore.getState().reset();
});

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  vi.resetAllMocks();
  beforeEach(async () => {
    queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);
    grantUserConfigRights();
    useCosStore.getState().reset();
  });

  afterEach(() => {
    resetMockWorker();
    useCosStore.getState().reset();
  });

  it('should render BreadCrumb component', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    setupBrowserTest(<AppView />, {
      initialRouterEntry: `/manage/cos/cos_list`,
      queryClient,
    });

    // BreadCrumb should show the home icon
    await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
  });

  it('should render main container structure', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    setupBrowserTest(<AppView />, {
      initialRouterEntry: `/manage/cos`,
      queryClient,
    });

    // BreadCrumb is rendered
    await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
  });

  it('should render BreadCrumb on different routes', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    setupBrowserTest(<AppView />, {
      initialRouterEntry: '/different/route',
      queryClient,
    });

    // BreadCrumb should always be visible regardless of route
    await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
  });

  it('should render CosListPanel on matching route', async () => {
    const getInfoInterceptor = createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
    const searchDirectoryInterceptor = createBrowserSoapAPIInterceptor('SearchDirectory', {});
    const getAccountInterceptor = createBrowserSoapAPIInterceptor('GetAccount', {});

    setupBrowserTest(<AppView />, {
      initialRouterEntry: `/manage/cos`,
      queryClient,
    });
    await getInfoInterceptor;
    await searchDirectoryInterceptor;
    await getAccountInterceptor;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await expect.element(page.getByText(/General/i)).toBeVisible();
    await expect.element(page.getByText('Details')).toBeVisible();
  });
});
