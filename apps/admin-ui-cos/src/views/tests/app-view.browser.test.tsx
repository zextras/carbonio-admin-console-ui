/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
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
    useCosStore.getState().reset();
    queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);
  });

  afterEach(() => {
    resetMockWorker();
    useCosStore.getState().reset();
  });

  it('should render BreadCrumb component', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: `/cos_list`,
      queryClient,
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('should render main container structure', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '',
      queryClient,
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('should render BreadCrumb on different routes', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {});
    createBrowserSoapAPIInterceptor('GetAccount', {});

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/different/route',
      queryClient,
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('should render CosListPanel and CosDetailPanel on list route', async () => {
    const mockCosListResponse = {
      cos: [
        {
          name: 'default',
          id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
          a: [
            { n: 'cn', _content: 'default' },
            { n: 'description', _content: 'Default COS' },
          ],
        },
      ],
      searchTotal: 1,
      more: false,
    };

    const getInfoInterceptor = createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
    const searchDirectoryInterceptor = createBrowserSoapAPIInterceptor(
      'SearchDirectory',
      mockCosListResponse,
    );

    const getAccountInterceptor = createBrowserSoapAPIInterceptor('GetAccount', {});

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: `/cos_list`,
      queryClient,
    });
    await getInfoInterceptor;
    await searchDirectoryInterceptor;
    await getAccountInterceptor;

    // Verify CosListPanel renders with action buttons
    await expect.element(page.getByText('General', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Details')).toBeVisible();

    // Verify "COS List" appears twice (in CosListPanel and CosDetailPanel)
    const cosListElements = page.getByText('COS List').all();
    expect(cosListElements).toHaveLength(2);
    await expect.element(cosListElements[0]).toBeVisible();
    await expect.element(cosListElements[1]).toBeVisible();
  });
});
