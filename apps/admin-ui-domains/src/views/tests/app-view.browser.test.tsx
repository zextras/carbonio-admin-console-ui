/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
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

    await expect.element(page.getByText('New Domain', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Manage', { exact: true })).not.toBeInTheDocument();
    await expect.element(page.getByText('Details', { exact: true })).not.toBeInTheDocument();
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

describe('AppView - restore account view', () => {
  const DOMAIN_ID = 'test-domain-id';
  const DOMAIN_NAME = 'example.com';

  type BackupAccount = {
    id: string;
    name: string;
    serverName: string;
    status: string;
    creationTimestamp: number;
    deletedTimestamp?: number;
  };

  const ACCOUNTS: Array<BackupAccount> = [
    {
      id: 'acc-1',
      name: 'alice@example.com',
      serverName: 'mail1.example.com',
      status: 'Active',
      creationTimestamp: new Date('2025-06-15').getTime(),
    },
    {
      id: 'acc-2',
      name: 'bob@example.com',
      serverName: 'mail2.example.com',
      status: 'Deleted',
      creationTimestamp: new Date('2025-03-10').getTime(),
      deletedTimestamp: new Date('2026-01-20').getTime(),
    },
  ];

  function interceptGetBackupAccounts(accounts: Array<BackupAccount> = ACCOUNTS): void {
    createBrowserAPIInterceptor(
      'get',
      /\/service\/extension\/zextras_admin\/backup\/getBackupAccounts/,
      () =>
        HttpResponse.json({
          accounts,
          maxPage: Math.max(1, Math.ceil(accounts.length / 10)),
        }),
    );
  }

  // Renders the whole AppView at the restore-account route so the real
  // container, wizard and select section are exercised together.
  function setupRestoreRoute(
    accounts: Array<BackupAccount> = ACCOUNTS,
  ): ReturnType<typeof setupBrowserTest> {
    interceptApis();
    interceptGetBackupAccounts(accounts);

    const queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], getAllConfigResponseMock().a);
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
      id: DOMAIN_ID,
      name: DOMAIN_NAME,
      a: [{ n: 'zimbraDomainStatus', _content: 'active' }],
    });

    return setupBrowserTest(<AppView />, {
      initialRouterEntry: `/${DOMAIN_ID}/${'restore_account'}`,
      queryClient,
      grantRights: 'config',
    });
  }

  afterEach(() => {
    resetMockWorker();
  });

  it('renders the select-account step with its description text', async () => {
    await setupRestoreRoute();

    await expect
      .element(
        page.getByText(
          /you'll be able to restore an entire account from the backup into a new account/i,
        ),
      )
      .toBeVisible();
  });

  it('lists the backup accounts returned by the service', async () => {
    await setupRestoreRoute();

    await expect.element(page.getByText('alice@example.com')).toBeVisible();
    await expect.element(page.getByText('bob@example.com')).toBeVisible();
  });

  it('advances to the Config step once an account is selected', async () => {
    await setupRestoreRoute();

    await page.getByText('alice@example.com').click();
    await page.getByRole('button', { name: 'NEXT', exact: true }).click();

    // The Config step renders the Domain search field.
    await expect.element(page.getByText('Domain', { exact: true })).toBeVisible();
    await expect.element(page.getByLabelText('Search')).toBeVisible();
  });

  it('resets to the select-account step when Cancel is clicked', async () => {
    await setupRestoreRoute();

    await page.getByText('alice@example.com').click();
    await page.getByRole('button', { name: 'NEXT', exact: true }).click();
    await expect.element(page.getByLabelText('Search')).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();

    // Back on the first step: the select-account description is shown again
    // and the Config search field is gone.
    await expect
      .element(
        page.getByText(
          /you'll be able to restore an entire account from the backup into a new account/i,
        ),
      )
      .toBeVisible();
    await expect.element(page.getByLabelText('Search')).not.toBeInTheDocument();
  });
});
