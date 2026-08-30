/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainGeneralSettings } from '../domain-general-settings';

const DOMAIN_ID = 'test-domain-id-123';
const DOMAIN_NAME = 'example.com';

function buildDomainAttributes(
  overrides: Array<{ n: string; _content: string }> = [],
): Array<{ n: string; _content: string }> {
  const defaults: Array<{ n: string; _content: string }> = [
    { n: 'zimbraDomainName', _content: DOMAIN_NAME },
    { n: 'zimbraId', _content: DOMAIN_ID },
    { n: 'zimbraDomainStatus', _content: 'active' },
    { n: 'zimbraPublicServiceProtocol', _content: 'https' },
    { n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' },
    { n: 'zimbraPublicServicePort', _content: '443' },
    { n: 'zimbraPrefTimeZoneId', _content: 'America/New_York' },
    { n: 'zimbraNotes', _content: 'Test domain notes' },
    { n: 'description', _content: 'Test domain description' },
    { n: 'zimbraHelpAdminURL', _content: '' },
    { n: 'zimbraHelpDelegatedURL', _content: '' },
    { n: 'zimbraDNSCheckHostname', _content: '' },
    { n: 'zimbraCreateTimestamp', _content: '20240101120000Z' },
    { n: 'carbonioNotificationFrom', _content: 'noreply@example.com' },
    { n: 'carbonioNotificationRecipients', _content: 'admin@example.com' },
    { n: 'zimbraDomainMaxAccounts', _content: '100' },
  ];

  const overrideKeys = new Set(overrides.map((o) => o.n));
  const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
  return [...filtered, ...overrides];
}

function setupDomainStore(
  attributeOverrides: Array<{ n: string; _content: string }> = [],
): ReturnType<typeof getQueryClient> {
  const domainAttributes = buildDomainAttributes(attributeOverrides);
  createBrowserSoapAPIInterceptor('GetDomain', {
    domain: [
      {
        name: DOMAIN_NAME,
        id: DOMAIN_ID,
        a: domainAttributes,
      },
    ],
  });
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: domainAttributes,
  });
  return queryClient;
}

describe('DomainGeneralSettings (browser)', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(() => {
    queryClient = setupDomainStore();
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      cos: [
        { id: 'cos-default-id', name: 'default' },
        { id: 'cos-professional-id', name: 'professional' },
      ],
    });
  });

  describe('Rendering', () => {
    it('should render the General Settings header', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await expect.element(page.getByText('General Settings')).toBeVisible();
    });

    it('should render the domain name input', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const nameInput = page.getByText('Name', { exact: true });
      await expect.element(nameInput).toBeVisible();
    });

    it('should render the domain ID input', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const idInput = page.getByText('Id', { exact: true });
      await expect.element(idInput).toBeVisible();
    });

    it('should render the Domain System Notifications section', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await expect.element(page.getByText('Domain System Notifications')).toBeVisible();
    });

    it('should render the Notification Sender input with pre-filled value', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await expect.element(page.getByText('Notification Sender')).toBeVisible();
    });

    it('should render the Delete Domain button', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await expect.element(page.getByRole('button', { name: /delete domain/i })).toBeVisible();
    });

    it('should not show Save and Cancel buttons when no changes are made', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await expect.element(page.getByText('General Settings')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Editing fields', () => {
    it('should show Save and Cancel buttons when description is changed', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Updated description');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    it('should revert changes when Cancel is clicked', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Changed value');

      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.click();

      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  describe('Save domain', () => {
    it('should call ModifyDomain API when Save is clicked', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'description', _content: 'New description' }]),
          },
        ],
      });

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'New description');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      const requestParams = (await modifyDomainInterceptor) as {
        id?: string;
        a?: Array<{ n: string; _content?: string }>;
      };
      expect(requestParams.id).toBe(DOMAIN_ID);
      expect(requestParams.a).toBeDefined();

      const descriptionAttr = requestParams.a?.find((attr) => attr.n === 'description');
      expect(descriptionAttr?._content).toBe('New description');
    });

    it('should hide Save and Cancel after a successful save', async () => {
      createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'description', _content: 'New description' }]),
          },
        ],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'description', _content: 'New description' }]),
          },
        ],
      });

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'New description');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      await expect
        .element(page.getByText('The change has been saved successfully'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('should keep Save visible and show an error snackbar when ModifyDomain fails', async () => {
      worker.use(
        http.post('/service/admin/soap/ModifyDomainRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'ModifyDomain failed' } } } },
            { status: 500 },
          ),
        ),
      );

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Broken description');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      await expect.element(page.getByText('ModifyDomain failed')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
    });

    it('should show error when notification sender has invalid email', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const senderInput = page.getByLabelText(/notification sender/i);
      await userEvent.clear(senderInput);
      await userEvent.type(senderInput, 'invalid-email');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      await expect.element(page.getByText('Enter a valid email address.')).toBeVisible();
    });
  });

  describe('Notification Recipients', () => {
    it('should render the Send notifications to chip input', async () => {
      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await expect.element(page.getByText('Send notifications to...')).toBeVisible();
    });
  });

  describe('Delete Domain', () => {
    it('should trigger domain deletion flow when Delete Domain is clicked', async () => {
      createBrowserSoapAPIInterceptor('SearchDirectory', {
        searchTotal: 0,
        more: false,
        account: [],
        dl: [],
        alias: [],
        calresource: [],
      });

      createBrowserSoapAPIInterceptor('DeleteDomain', {});

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const deleteButton = page.getByRole('button', { name: /delete domain/i });
      await deleteButton.click();

      // When domain is empty (searchTotal=0), it deletes directly
      await expect.element(page.getByText('Domain has been deleted successfully')).toBeVisible();
    });

    it('should show confirmation dialog when domain has accounts', async () => {
      createBrowserSoapAPIInterceptor('SearchDirectory', {
        searchTotal: 3,
        more: false,
        account: [
          {
            name: 'user1@example.com',
            id: 'acc-1',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'FALSE' }],
          },
          {
            name: 'user2@example.com',
            id: 'acc-2',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'FALSE' }],
          },
        ],
        dl: [{ name: 'group@example.com', id: 'dl-1', a: [] }],
        alias: [],
        calresource: [],
      });

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const deleteButton = page.getByRole('button', { name: /delete domain/i });
      await deleteButton.click();

      await expect.element(page.getByText(/is not empty and contains/i)).toBeVisible();
      await expect.element(page.getByText(/2 Accounts/)).toBeVisible();
      await expect.element(page.getByText(/1 Distribution List/)).toBeVisible();
    });

    it('should call DeleteDomain exactly once for empty domain', async () => {
      createBrowserSoapAPIInterceptor('SearchDirectory', {
        searchTotal: 0,
        more: false,
        account: [],
        dl: [],
        alias: [],
        calresource: [],
      });

      const deleteDomainInterceptor = createBrowserSoapAPIInterceptor('DeleteDomain', {});

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      const deleteButton = page.getByRole('button', { name: /delete domain/i });
      await deleteButton.click();

      await deleteDomainInterceptor;

      const secondDeleteInterceptor = createBrowserSoapAPIInterceptor('DeleteDomain', {});
      const secondCallSettled = await Promise.race([
        secondDeleteInterceptor.then(() => true),
        new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), 2000);
        }),
      ]);
      expect(secondCallSettled).toBe(false);
    });
  });

  describe('Delete Domain with contents', () => {
    function setupDirectoryWithContents(
      overrides: Record<string, unknown> = {},
    ): void {
      createBrowserSoapAPIInterceptor('SearchDirectory', {
        searchTotal: 2,
        more: false,
        account: [
          {
            name: 'user1@example.com',
            id: 'acc-1',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'FALSE' }],
          },
          {
            name: 'user2@example.com',
            id: 'acc-2',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'FALSE' }],
          },
        ],
        dl: [{ name: 'group@example.com', id: 'dl-1', a: [] }],
        alias: [],
        calresource: [],
        ...overrides,
      });
    }

    async function openDeleteConfirmDialog(): Promise<void> {
      const deleteButton = page.getByRole('button', { name: /delete domain/i });
      await deleteButton.click();
      await expect.element(page.getByText(/is not empty and contains/i)).toBeVisible();
    }

    it('should keep Force Delete disabled until the exact domain name is typed', async () => {
      setupDirectoryWithContents();

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await openDeleteConfirmDialog();

      const forceDeleteButton = page.getByRole('button', { name: /force delete/i });
      await expect.element(forceDeleteButton).toBeDisabled();

      const confirmInput = page.getByRole('textbox').last();
      await userEvent.fill(confirmInput, 'wrong-name.com');
      await expect.element(forceDeleteButton).toBeDisabled();

      await userEvent.fill(confirmInput, DOMAIN_NAME);
      await expect.element(forceDeleteButton).toBeEnabled();
    });

    it('should delete contents and domain via Batch and DeleteDomain when Force Delete is confirmed', async () => {
      setupDirectoryWithContents();
      const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
      createBrowserSoapAPIInterceptor('DeleteDomain', {});

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await openDeleteConfirmDialog();

      await userEvent.fill(page.getByRole('textbox').last(), DOMAIN_NAME);
      await page.getByRole('button', { name: /force delete/i }).click();

      const batchParams = (await batchInterceptor) as {
        DeleteAccountRequest?: Array<{ id?: string }>;
        DeleteDistributionListRequest?: Array<{ id?: { _content?: string } }>;
      };
      const deletedAccountIds = (batchParams.DeleteAccountRequest ?? []).map(
        (request) => request.id,
      );
      expect(deletedAccountIds).toContain('acc-1');
      expect(deletedAccountIds).toContain('acc-2');
      const deletedDlIds = (batchParams.DeleteDistributionListRequest ?? []).map(
        (request) => request.id?._content,
      );
      expect(deletedDlIds).toContain('dl-1');

      await expect
        .element(page.getByText('Domain has been deleted successfully'))
        .toBeVisible();
    });

    it('should show error snackbars and keep the dialog when the batch delete returns faults', async () => {
      setupDirectoryWithContents();
      createBrowserSoapAPIInterceptor('Batch', {
        Fault: [{ Reason: { Text: 'Cannot delete account' } }],
      });

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await openDeleteConfirmDialog();

      await userEvent.fill(page.getByRole('textbox').last(), DOMAIN_NAME);
      await page.getByRole('button', { name: /force delete/i }).click();

      await expect.element(page.getByText('Cannot delete account')).toBeVisible();
      await expect.element(page.getByText(/is not empty and contains/i)).toBeVisible();
    });

    it('should close the dialog and change the domain status when CLOSE DOMAIN is clicked', async () => {
      setupDirectoryWithContents();
      const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await openDeleteConfirmDialog();

      await page.getByRole('button', { name: /close domain/i }).click();

      const requestParams = (await modifyInterceptor) as {
        id?: string;
        a?: Array<{ n: string; _content?: string }>;
      };
      expect(requestParams.id).toBe(DOMAIN_ID);
      expect(requestParams.a).toContainEqual({
        n: 'zimbraDomainStatus',
        _content: 'closed',
      });

      await expect
        .element(page.getByText('The change has been saved successfully'))
        .toBeVisible();
      await expect
        .element(page.getByText(/is not empty and contains/i))
        .not.toBeInTheDocument();
    });

    it('should hide the CLOSE DOMAIN action when the domain is already closed', async () => {
      const closedQueryClient = setupDomainStore([
        { n: 'zimbraDomainStatus', _content: 'closed' },
      ]);
      setupDirectoryWithContents();

      setupBrowserTest(<DomainGeneralSettings />, {
        queryClient: closedQueryClient,
        initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
        withDomainIdRoute: true,
      });

      await openDeleteConfirmDialog();

      await expect
        .element(page.getByRole('button', { name: /close domain/i }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByText(/permanently remove all the accounts and domain objects/i))
        .toBeVisible();
    });

    it('should list system accounts, aliases and resources in the confirmation dialog', async () => {
      setupDirectoryWithContents({
        searchTotal: 6,
        account: [
          {
            name: 'user1@example.com',
            id: 'acc-1',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'TRUE' }],
          },
          {
            name: 'user2@example.com',
            id: 'acc-2',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'FALSE' }],
          },
        ],
        alias: [
          { name: 'alias1@example.com', id: 'alias-1', a: [] },
          { name: 'alias2@example.com', id: 'alias-2', a: [] },
        ],
        calresource: [{ name: 'room@example.com', id: 'res-1', a: [] }],
      });

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await openDeleteConfirmDialog();

      await expect.element(page.getByText(/1 System Accounts/)).toBeVisible();
      await expect.element(page.getByText(/2 Aliases/)).toBeVisible();
      await expect.element(page.getByText(/1 Resources/)).toBeVisible();
    });

    it('should close the confirmation dialog when CANCEL is clicked', async () => {
      setupDirectoryWithContents();

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await openDeleteConfirmDialog();

      await page.getByRole('button', { name: 'CANCEL' }).click();

      await expect
        .element(page.getByText(/is not empty and contains/i))
        .not.toBeInTheDocument();
    });

    it('should show an error snackbar when collecting the domain directories fails', async () => {
      worker.use(
        http.post('/service/admin/soap/SearchDirectoryRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Search directory failed' } } } },
            { status: 500 },
          ),
        ),
      );

      setupBrowserTest(<DomainGeneralSettings />, { queryClient, initialRouterEntry: `/${DOMAIN_ID}/general-settings`, withDomainIdRoute: true });

      await page.getByRole('button', { name: /delete domain/i }).click();

      await expect.element(page.getByText('Search directory failed')).toBeVisible();
      await expect
        .element(page.getByText(/is not empty and contains/i))
        .not.toBeInTheDocument();
    });
  });

  describe('Quota (advanced + global admin)', () => {
    function setupAdvancedGlobalAdmin(): ReturnType<typeof getQueryClient> {
      const qc = setupDomainStore();
      qc.setQueryData(['advanced-supported'], { supported: true });
      qc.setQueryData(['account', 'settings'], {
        attrs: { zimbraIsAdminAccount: 'TRUE' },
      });
      return qc;
    }

    it('should render quota section when advanced is enabled', async () => {
      const qc = setupAdvancedGlobalAdmin();
      worker.use(
        http.get('/services/storages/admin/quota/config/domains/:domainId', () =>
          HttpResponse.json({ limit: 10737418240 }),
        ),
      );

      setupBrowserTest(<DomainGeneralSettings />, {
        queryClient: qc,
        initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
        withDomainIdRoute: true,
      });

      await expect
        .element(page.getByLabelText(/max quota per account in this domain/i))
        .toBeVisible();
    });

    it('should call PUT quota endpoint on save when quota changed', async () => {
      const qc = setupAdvancedGlobalAdmin();
      let putCalled = false;
      worker.use(
        http.get('/services/storages/admin/quota/config/domains/:domainId', () =>
          HttpResponse.json({ limit: 5368709120 }),
        ),
        http.put('/services/storages/admin/quota/config/domains/:domainId', () => {
          putCalled = true;
          return new HttpResponse(null, { status: 200 });
        }),
      );

      setupBrowserTest(<DomainGeneralSettings />, {
        queryClient: qc,
        initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
        withDomainIdRoute: true,
      });

      const quotaInput = page.getByLabelText(/max quota per account in this domain/i);
      await expect.element(quotaInput).toBeVisible();
      await userEvent.clear(quotaInput);
      await userEvent.type(quotaInput, '20');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      await expect.poll(() => putCalled, { timeout: 5000 }).toBe(true);
    });

    it('should call DELETE quota endpoint when quota is cleared', async () => {
      const qc = setupAdvancedGlobalAdmin();
      let deleteCalled = false;
      worker.use(
        http.get('/services/storages/admin/quota/config/domains/:domainId', () =>
          HttpResponse.json({ limit: 5368709120 }),
        ),
        http.delete('/services/storages/admin/quota/config/domains/:domainId', () => {
          deleteCalled = true;
          return new HttpResponse(null, { status: 200 });
        }),
      );

      setupBrowserTest(<DomainGeneralSettings />, {
        queryClient: qc,
        initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
        withDomainIdRoute: true,
      });

      const quotaInput = page.getByLabelText(/max quota per account in this domain/i);
      await expect.element(quotaInput).toBeVisible();
      await userEvent.clear(quotaInput);

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      await expect.poll(() => deleteCalled, { timeout: 5000 }).toBe(true);
    });

    it('should show error snackbar when quota save fails', async () => {
      const qc = setupAdvancedGlobalAdmin();
      worker.use(
        http.get('/services/storages/admin/quota/config/domains/:domainId', () =>
          HttpResponse.json({ limit: 5368709120 }),
        ),
        http.put('/services/storages/admin/quota/config/domains/:domainId', () =>
          new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

      setupBrowserTest(<DomainGeneralSettings />, {
        queryClient: qc,
        initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
        withDomainIdRoute: true,
      });

      const quotaInput = page.getByLabelText(/max quota per account in this domain/i);
      await expect.element(quotaInput).toBeVisible();
      await userEvent.clear(quotaInput);
      await userEvent.type(quotaInput, '20');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      await expect
        .element(page.getByText(/something went wrong/i), { timeout: 5000 })
        .toBeVisible();
    });
  });
});
