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
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
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

describe('AppView - global 2FA view', () => {
  // Both listPolicies and setPolicy POST to the same zextras endpoint and are
  // distinguished by the `action` field. The component reads the JSON string at
  // res.Body.response.content, so responses mirror that envelope.
  type PolicyEntry = Record<string, { trustedDevice?: number; trustedIpRange: string[] }>;

  const POLICY_VALUES: PolicyEntry[] = [
    { WebAdminUI: { trustedDevice: 1, trustedIpRange: [] } },
    { WebUI: { trustedDevice: 2, trustedIpRange: [] } },
  ];

  function zextrasEnvelope(content: unknown): object {
    return { Body: { response: { content: JSON.stringify(content) } } };
  }

  type Setup2faOptions = {
    values?: PolicyEntry[];
    setPolicyResult?: { ok: boolean; message?: string; error?: string };
  };

  function interceptZextras(options: Setup2faOptions = {}): void {
    const values = options.values ?? POLICY_VALUES;
    const setPolicyResult = options.setPolicyResult ?? { ok: true, message: 'ok' };

    worker.use(
      http.post('/service/admin/soap/zextras', async ({ request }) => {
        const requestBody = (await request.json()) as any;
        const action = requestBody?.Body?.zextras?.action;
        if (action === 'setPolicy') {
          return HttpResponse.json(zextrasEnvelope(setPolicyResult));
        }
        // listPolicies
        return HttpResponse.json(zextrasEnvelope({ response: { values } }));
      }),
    );
  }

  // Renders the whole AppView at the global 2FA route so the real page, its
  // config child and the list/set services run together.
  function setup2faRoute(options: Setup2faOptions = {}): ReturnType<typeof setupBrowserTest> {
    interceptApis();
    interceptZextras(options);

    const queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], getAllConfigResponseMock().a);

    return setupBrowserTest(<AppView />, {
      initialRouterEntry: `/global/2-factor-authentication`,
      queryClient,
      grantRights: 'config',
    });
  }

  afterEach(() => {
    resetMockWorker();
  });

  it('renders the configuration section and its help text', async () => {
    await setup2faRoute();

    await expect
      .element(page.getByText('Configuration', { exact: true }))
      .toBeVisible();
    await expect
      .element(
        page.getByText(
          /Setup the networks or the devices \(IPs\) that will not require the 2FA authentication/i,
        ),
      )
      .toBeVisible();
  });

  it('renders a row per service policy', async () => {
    await setup2faRoute();

    await expect.element(page.getByText('Admin API', { exact: true })).toBeVisible();
    await expect.element(page.getByText('WebUI', { exact: true })).toBeVisible();
    await expect.element(page.getByText('ActiveSync', { exact: true })).toBeVisible();
  });

  it('hides Save and Cancel until a change is made', async () => {
    await setup2faRoute();

    // Wait for the page to settle on the config section.
    await expect.element(page.getByText('Configuration', { exact: true })).toBeVisible();

    await expect.element(page.getByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();

    await page.getByRole('button', { name: /apply to all services/i }).click();

    await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();
    await expect.element(page.getByRole('button', { name: /^cancel$/i })).toBeVisible();
  });

  it('saves changed policies and shows the success snackbar', async () => {
    await setup2faRoute();

    await page.getByRole('button', { name: /apply to all services/i }).click();
    const saveButton = page.getByRole('button', { name: /^save$/i });
    await expect.element(saveButton).toBeVisible();

    await saveButton.click();

    await expect
      .element(page.getByText('The settings have been applied to all services'))
      .toBeVisible();
    // On success the form is no longer dirty, so the actions disappear.
    await expect.element(page.getByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });

  it('shows an error snackbar when saving a policy fails', async () => {
    await setup2faRoute({
      setPolicyResult: { ok: false, error: 'Policy could not be saved' },
    });

    await page.getByRole('button', { name: /apply to all services/i }).click();
    const saveButton = page.getByRole('button', { name: /^save$/i });
    await expect.element(saveButton).toBeVisible();

    await saveButton.click();

    await expect.element(page.getByText('Policy could not be saved')).toBeVisible();
  });
});
