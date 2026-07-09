/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getAllConfigResponseMock,
  getGetInfoResponseMock,
  getQueryClient,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { AppView } from '../app-view';

function interceptApis(): void {
  createBrowserSoapAPIInterceptor('SearchDirectory', { domain: [], searchTotal: 0, more: false });
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserSoapAPIInterceptor('GetAccount', {});
  createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
}

describe('AppView', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders the breadcrumb on the index route', async () => {
    interceptApis();
    const queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], getAllConfigResponseMock().a);

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/',
      queryClient,
      grantRights: 'config',
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('renders the sidebar Manage and Details sections', async () => {
    interceptApis();
    const queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], getAllConfigResponseMock().a);

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/',
      queryClient,
      grantRights: 'config',
    });

    await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
  });

  it('renders the empty state on the index route', async () => {
    interceptApis();
    const queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], getAllConfigResponseMock().a);

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/',
      queryClient,
      grantRights: 'config',
    });

    await expect.element(page.getByText(/Please select a domain/i)).toBeVisible();
  });

  it('renders the create form on /create-new-domain', async () => {
    interceptApis();
    const queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], getAllConfigResponseMock().a);

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/create-new-domain',
      queryClient,
      grantRights: 'config',
    });

    await expect.element(page.getByText('New Domain')).toBeVisible();
  });

  it('renders the global settings panel on /global/settings', async () => {
    interceptApis();
    const queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], getAllConfigResponseMock().a);

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/global/settings',
      queryClient,
      grantRights: 'config',
    });

    await expect.element(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });
});
