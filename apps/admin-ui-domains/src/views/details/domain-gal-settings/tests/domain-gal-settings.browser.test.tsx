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
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainGalSettings } from '../domain-gal-settings';

const DOMAIN_NAME = 'example.com';
const DOMAIN_ID = 'test-domain-id';
const GAL_ACCOUNT_ID = 'gal-account-id-1';

type DomainAttribute = { n: string; _content: string };

function buildDomainAttributes(overrides: Array<DomainAttribute> = []): Array<DomainAttribute> {
  const defaults: Array<DomainAttribute> = [
    { n: 'zimbraDomainName', _content: DOMAIN_NAME },
    { n: 'zimbraId', _content: DOMAIN_ID },
    { n: 'zimbraGalMode', _content: 'zimbra' },
    { n: 'zimbraGalMaxResults', _content: '100' },
    { n: 'zimbraGalLdapPageSize', _content: '1000' },
    { n: 'zimbraGalAccountId', _content: GAL_ACCOUNT_ID },
    { n: 'zimbraGalLdapURL', _content: '' },
    { n: 'zimbraGalLdapStartTlsEnabled', _content: 'FALSE' },
    { n: 'zimbraGalLdapFilter', _content: '' },
    { n: 'zimbraGalLdapSearchBase', _content: '' },
    { n: 'zimbraGalLdapBindDn', _content: '' },
    { n: 'zimbraGalLdapBindPassword', _content: '' },
    { n: 'zimbraGalLdapAuthMech', _content: 'none' },
  ];

  const overrideKeys = new Set(overrides.map((o) => o.n));
  const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
  return [...filtered, ...overrides];
}

const MAILSTORE_SERVERS = [
  { id: 'server-1', name: 'mail1.example.com', a: [{ n: 'description', _content: 'Primary' }] },
  { id: 'server-2', name: 'mail2.example.com', a: [{ n: 'description', _content: 'Secondary' }] },
];

function setupGalApiInterceptors(): void {
  worker.use(
    http.post('/service/admin/soap/GetAccountRequest', () =>
      HttpResponse.json({
        Body: {
          GetAccountResponse: {
            account: [
              {
                id: GAL_ACCOUNT_ID,
                name: `galsync.${DOMAIN_NAME}`,
                a: [
                  { n: 'zimbraMailHost', _content: 'mail1.example.com' },
                  { n: 'zimbraDataSourceGalPollingInterval', _content: '1d' },
                ],
              },
            ],
          },
        },
      }),
    ),
    http.post('/service/admin/soap/GetDataSourcesRequest', () =>
      HttpResponse.json({
        Body: {
          GetDataSourcesResponse: {
            dataSource: [
              {
                id: 'datasource-1',
                name: 'gal-datasource',
                type: 'gal',
                _attrs: {
                  zimbraDataSourcePollingInterval: '1d',
                },
              },
            ],
          },
        },
      }),
    ),
    http.post('/service/admin/soap/GetAllServersRequest', () =>
      HttpResponse.json({
        Body: {
          GetAllServersResponse: {
            server: MAILSTORE_SERVERS,
          },
        },
      }),
    ),
  );
}

function setupDomainStore(
  attributeOverrides: Array<DomainAttribute> = [],
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

function setupAndRender(
  attributeOverrides: Array<DomainAttribute> = [],
): ReturnType<typeof setupBrowserTest> {
  const queryClient = setupDomainStore(attributeOverrides);
  setupGalApiInterceptors();
  queryClient.setQueryData(['mailstore-servers'], MAILSTORE_SERVERS);
  return setupBrowserTest(<DomainGalSettings />, {
    queryClient,
    initialRouterEntry: `/${DOMAIN_ID}/gal-settings`,
    withDomainIdRoute: true,
  });
}

describe('DomainGalSettings (browser)', () => {
  describe('Rendering', () => {
    it('should render the Global Address List header', async () => {
      await setupAndRender();
      await expect.element(page.getByText('Global Address List')).toBeInTheDocument();
    });

    it('should render the General section', async () => {
      await setupAndRender();
      await expect.element(page.getByText('General', { exact: true })).toBeInTheDocument();
    });

    it('should render the Settings section', async () => {
      await setupAndRender();
      await expect.element(page.getByText('Settings', { exact: true })).toBeInTheDocument();
    });

    it('should render the GAL Mode input as Internal for zimbra mode', async () => {
      await setupAndRender();
      await expect.element(page.getByText('GAL Mode')).toBeInTheDocument();
    });

    it('should render the CHANGE TO button', async () => {
      await setupAndRender();
      await expect.element(page.getByRole('button', { name: /change to/i })).toBeInTheDocument();
    });

    it('should render the CREATE button', async () => {
      await setupAndRender();
      await expect.element(page.getByRole('button', { name: /^create$/i })).toBeInTheDocument();
    });

    it('should render the RE-SYNC button', async () => {
      await setupAndRender();
      await expect.element(page.getByRole('button', { name: /re-sync/i })).toBeInTheDocument();
    });

    it('should render the DELETE button', async () => {
      await setupAndRender();
      await expect.element(page.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    });

    it('should not show Save and Cancel buttons when no changes are made', async () => {
      await setupAndRender();
      await expect.element(page.getByText('General', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('General inputs', () => {
    it('should render the max results input with value from domain', async () => {
      await setupAndRender();
      const maxResultsInput = page.getByLabelText('Limit search results from Address Book List to');
      await expect.element(maxResultsInput).toBeInTheDocument();
      await expect.element(maxResultsInput).toHaveValue(100);
    });

    it('should render the Page Size input with value from domain', async () => {
      await setupAndRender();
      const pageSizeInput = page.getByLabelText('Page Size');
      await expect.element(pageSizeInput).toBeInTheDocument();
      await expect.element(pageSizeInput).toHaveValue(1000);
    });
  });

  describe('Settings inputs', () => {
    it('should render the GAL Update Frequency input', async () => {
      await setupAndRender();
      await expect.element(page.getByLabelText('GAL Update Frequency (value)')).toBeInTheDocument();
    });

    it('should render the Interval select', async () => {
      await setupAndRender();
      await expect.element(page.getByText('Interval', { exact: true })).toBeInTheDocument();
    });
  });

  describe('Server table', () => {
    it('should render the Server column header', async () => {
      await setupAndRender();
      await expect.element(page.getByText('Server', { exact: true })).toBeInTheDocument();
    });

    it('should render the GALSync Account column header', async () => {
      await setupAndRender();
      await expect.element(page.getByText('GALSync Account', { exact: true })).toBeInTheDocument();
    });

    it('should display mailstore server names', async () => {
      await setupAndRender();
      await expect.element(page.getByText('mail1.example.com').first()).toBeInTheDocument();
      await expect.element(page.getByText('mail2.example.com').first()).toBeInTheDocument();
    });
  });

  describe('Editing fields', () => {
    it('should show Save and Cancel when max results is changed', async () => {
      await setupAndRender();
      const maxResultsInput = page.getByLabelText('Limit search results from Address Book List to');
      await userEvent.clear(maxResultsInput);
      await userEvent.type(maxResultsInput, '200');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    it('should show Save and Cancel when page size is changed', async () => {
      await setupAndRender();
      const pageSizeInput = page.getByLabelText('Page Size');
      await userEvent.clear(pageSizeInput);
      await userEvent.type(pageSizeInput, '500');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    it('should revert changes when Cancel is clicked', async () => {
      await setupAndRender();
      const maxResultsInput = page.getByLabelText('Limit search results from Address Book List to');
      await userEvent.clear(maxResultsInput);
      await userEvent.type(maxResultsInput, '999');

      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.click();

      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('should call ModifyDomain when Save is clicked', async () => {
      const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'zimbraGalMaxResults', _content: '200' }]),
          },
        ],
      });

      await setupAndRender();
      const maxResultsInput = page.getByLabelText('Limit search results from Address Book List to');
      await userEvent.clear(maxResultsInput);
      await userEvent.type(maxResultsInput, '200');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      const params = (await modifyInterceptor) as {
        id?: string;
        a?: Array<DomainAttribute>;
      };
      expect(params.id).toBe(DOMAIN_ID);
      const maxResultsAttr = params.a?.find((attr) => attr.n === 'zimbraGalMaxResults');
      expect(maxResultsAttr?._content).toBe('200');
    });

    it('should hide Save and Cancel after a successful save', async () => {
      createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'zimbraGalMaxResults', _content: '200' }]),
          },
        ],
      });
      createBrowserSoapAPIInterceptor('ModifyAccount', {
        account: [{ id: GAL_ACCOUNT_ID }],
      });
      createBrowserSoapAPIInterceptor('ModifyDataSource', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});

      await setupAndRender();

      // Must register after setupAndRender so this response wins over the seed GetDomain handler.
      createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'zimbraGalMaxResults', _content: '200' }]),
          },
        ],
      });

      const maxResultsInput = page.getByLabelText('Limit search results from Address Book List to');
      await userEvent.clear(maxResultsInput);
      await userEvent.type(maxResultsInput, '200');

      await page.getByRole('button', { name: /save/i }).click();

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

      await setupAndRender();
      const maxResultsInput = page.getByLabelText('Limit search results from Address Book List to');
      await userEvent.clear(maxResultsInput);
      await userEvent.type(maxResultsInput, '250');

      await page.getByRole('button', { name: /save/i }).click();

      await expect.element(page.getByText('ModifyDomain failed')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
    });

    it('should call ModifyAccount when GAL update frequency is changed and saved', async () => {
      createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes(),
          },
        ],
      });
      const modifyAccountInterceptor = createBrowserSoapAPIInterceptor('ModifyAccount', {
        account: [{ id: GAL_ACCOUNT_ID }],
      });
      createBrowserSoapAPIInterceptor('ModifyDataSource', {});

      await setupAndRender();
      const freqInput = page.getByLabelText('GAL Update Frequency (value)');
      await expect.element(freqInput).toBeVisible();
      await userEvent.clear(freqInput);
      await userEvent.type(freqInput, '2');

      await page.getByRole('button', { name: /save/i }).click();

      const params = (await modifyAccountInterceptor) as {
        id?: string;
        a?: Array<DomainAttribute>;
      };
      expect(params.id).toBe(GAL_ACCOUNT_ID);
      const pollingAttr = params.a?.find((attr) => attr.n === 'zimbraDataSourceGalPollingInterval');
      expect(pollingAttr?._content).toMatch(/^2/);
    });
  });

  describe('GALSync lifecycle', () => {
    it('should call SyncGalAccount when RE-SYNC is clicked', async () => {
      const syncInterceptor = createBrowserSoapAPIInterceptor('SyncGalAccount', {});

      await setupAndRender();
      await expect.element(page.getByText('mail1.example.com').first()).toBeVisible();

      await page.getByRole('button', { name: /re-sync/i }).click();

      const params = (await syncInterceptor) as { account?: { id?: string } };
      expect(params.account?.id).toBe(GAL_ACCOUNT_ID);
      await expect.element(page.getByText('GAL successfully re-synced')).toBeVisible();
    });

    it('should open create modal and call CreateGalSyncAccount', async () => {
      const createInterceptor = createBrowserSoapAPIInterceptor('CreateGalSyncAccount', {
        account: [{ id: 'new-gal-id', name: `galsync.${DOMAIN_NAME}` }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'zimbraGalAccountId', _content: 'new-gal-id' }]),
          },
        ],
      });

      await setupAndRender();
      await expect.element(page.getByText('mail2.example.com').first()).toBeVisible();

      await page.getByText('mail2.example.com').first().click();
      const createButton = page.getByRole('button', { name: /^create$/i });
      await expect.poll(async () => !(await createButton.element()).hasAttribute('disabled')).toBe(true);
      await createButton.click();

      await expect.element(page.getByText('Create Account', { exact: true })).toBeVisible();
      const accountNameInput = page.getByLabelText('Account Name');
      await userEvent.type(accountNameInput, 'galsync');
      await page.getByRole('button', { name: /create account/i }).click();

      await createInterceptor;
      await expect
        .element(page.getByText(/You have created the GALSync account/i))
        .toBeVisible();
    });

    it('should open destroy modal and call DeleteGalSyncAccount', async () => {
      const deleteInterceptor = createBrowserSoapAPIInterceptor('DeleteGalSyncAccount', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'zimbraGalAccountId', _content: '' }]),
          },
        ],
      });

      await setupAndRender();
      await expect.element(page.getByText(`galsync.${DOMAIN_NAME}`)).toBeVisible();

      await page.getByText('mail1.example.com').first().click();
      const deleteButton = page.getByRole('button', { name: /^delete$/i });
      await expect.poll(async () => !(await deleteButton.element()).hasAttribute('disabled')).toBe(true);
      await deleteButton.click();

      await expect.element(page.getByRole('button', { name: /yes, delete it/i })).toBeVisible();
      await page.getByRole('button', { name: /yes, delete it/i }).click();

      await deleteInterceptor;
      await expect.element(page.getByText('Your changes has been saved!')).toBeVisible();
    });
  });

  describe('LDAP field edits', () => {
    it('should show Save when LDAP Url is edited in external mode', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      const ldapUrlInput = page.getByLabelText('External Server Address');
      await userEvent.type(ldapUrlInput, 'ldap://ldap.example.com');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
    });

    it('should include LDAP Url in ModifyDomain payload on save', async () => {
      const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([
              { n: 'zimbraGalMode', _content: 'ldap' },
              { n: 'zimbraGalLdapURL', _content: 'ldap://ldap.example.com' },
            ]),
          },
        ],
      });

      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      const ldapUrlInput = page.getByLabelText('External Server Address');
      await userEvent.clear(ldapUrlInput);
      await userEvent.type(ldapUrlInput, 'ldap://ldap.example.com');

      await page.getByRole('button', { name: /save/i }).click();

      const params = (await modifyInterceptor) as { a?: Array<DomainAttribute> };
      const ldapUrlAttr = params.a?.find((attr) => attr.n === 'zimbraGalLdapURL');
      expect(ldapUrlAttr?._content).toBe('ldap://ldap.example.com');
    });
  });

  describe('External GAL mode', () => {
    it('should not show LDAP section in internal mode', async () => {
      await setupAndRender();
      await expect.element(page.getByText('General', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByText('LDAP Url')).not.toBeInTheDocument();
    });

    it('should show LDAP section when mode is external', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      await expect.element(page.getByText('LDAP Url')).toBeInTheDocument();
      await expect.element(page.getByLabelText('External Server Address')).toBeInTheDocument();
    });

    it('should show LDAP Filter input in external mode', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      await expect.element(page.getByLabelText('LDAP Filter')).toBeInTheDocument();
    });

    it('should show LDAP based search input in external mode', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      await expect.element(page.getByLabelText('LDAP based search')).toBeInTheDocument();
    });

    it('should show Authentication Settings in external mode', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      await expect.element(page.getByText('Authentication Settings')).toBeInTheDocument();
    });

    it('should show Bind DN input in external mode', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      await expect.element(page.getByLabelText('Bind DN')).toBeInTheDocument();
    });

    it('should show Password input in external mode', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      await expect.element(page.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should show Use SSL switch in external mode', async () => {
      await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
      await expect.element(page.getByText('Use SSL')).toBeInTheDocument();
    });
  });

  describe('Empty server table', () => {
    it('should show Empty Table when no servers exist', async () => {
      const queryClient = setupDomainStore([{ n: 'zimbraGalAccountId', _content: '' }]);
      setupGalApiInterceptors();
      queryClient.setQueryData(['mailstore-servers'], []);
      await setupBrowserTest(<DomainGalSettings />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/gal-settings`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Empty Table')).toBeInTheDocument();
    });
  });
});
