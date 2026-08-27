/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type QueryClient } from '@tanstack/react-query';
import { domainByIdKey } from '@zextras/ui-shared';
import {
  advancedSupportedApiForBrowser,
  getQueryClient,
  setupBrowserTest as _setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import { ManageDelegates } from '../manage-delegates';

vi.mock('../../../edit-account/edit-account', () => ({
  EditAccount: (): ReactElement => <div>EDIT-ACCOUNT-VIEW</div>,
}));

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function seedDomainData(
  queryClient: QueryClient,
  extraAttrs: Array<{ n: string; _content: string }> = [],
): void {
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }, ...extraAttrs],
  });
}

function setupBrowserTest(
  ui: ReactElement,
  options?: {
    queryClient?: QueryClient;
    extraDomainAttrs?: Array<{ n: string; _content: string }>;
  },
): Promise<RenderResult> {
  const queryClient = options?.queryClient ?? getQueryClient();
  seedDomainData(queryClient, options?.extraDomainAttrs ?? []);
  return _setupBrowserTest(ui, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
}

type AccountEntry = {
  name: string;
  id: string;
  a: Array<{ n: string; _content: string }>;
};

function buildDelegateAccount(
  email: string,
  id: string,
  overrides: {
    displayName?: string;
    isAdmin?: string;
    isDelegated?: string;
  } = {},
): AccountEntry {
  const { displayName = email.split('@')[0], isAdmin = 'FALSE', isDelegated = 'TRUE' } = overrides;
  return {
    name: email,
    id,
    a: [
      { n: 'mail', _content: email },
      { n: 'displayName', _content: displayName },
      { n: 'zimbraAccountStatus', _content: 'active' },
      { n: 'zimbraIsAdminAccount', _content: isAdmin },
      { n: 'zimbraIsDelegatedAdminAccount', _content: isDelegated },
      { n: 'zimbraIsSystemAccount', _content: 'FALSE' },
      { n: 'zimbraIsExternalVirtualAccount', _content: 'FALSE' },
      { n: 'description', _content: '' },
      { n: 'zimbraId', _content: id },
      { n: 'zimbraCOSId', _content: 'cos-default-id' },
    ],
  };
}

const DELEGATE_ACCOUNTS: Array<AccountEntry> = [
  buildDelegateAccount('delegated1@example.com', 'del-1', { displayName: 'Delegate One' }),
  buildDelegateAccount('delegated2@example.com', 'del-2', {
    displayName: 'Delegate Two',
    isDelegated: 'TRUE',
  }),
  buildDelegateAccount('globaladmin@example.com', 'del-3', {
    displayName: 'Global Admin',
    isAdmin: 'TRUE',
    isDelegated: 'FALSE',
  }),
];

type SearchDirectoryBody = {
  Body: {
    SearchDirectoryRequest: {
      types: string;
      query?: string;
      domain?: string;
      [key: string]: unknown;
    };
  };
};

type AccountsRequestParams = {
  offset?: number;
  limit?: number;
};

/**
 * Setup MSW handler for all SearchDirectory calls.
 * Routes responses based on `types` and `query` parameters in the request body.
 */
function setupSearchDirectoryHandler(
  accounts: Array<AccountEntry> = DELEGATE_ACCOUNTS,
  options: {
    onAccountsRequest?: (params: AccountsRequestParams) => void;
    delayAccountsMs?: number;
  } = {},
): void {
  const { onAccountsRequest, delayAccountsMs = 0 } = options;

  worker.use(
    http.post<never, SearchDirectoryBody>(
      '/service/admin/soap/SearchDirectoryRequest',
      async ({ request }) => {
        const body = await request.json();
        const params = body?.Body?.SearchDirectoryRequest;

        // Account list query (types = 'accounts')
        if (params?.types === 'accounts') {
          onAccountsRequest?.(params as AccountsRequestParams);
          if (delayAccountsMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayAccountsMs));
          }
          return HttpResponse.json({
            Body: {
              SearchDirectoryResponse: {
                account: accounts,
                searchTotal: accounts.length,
                more: false,
              },
            },
          });
        }

        // Fallback
        return HttpResponse.json({
          Body: {
            SearchDirectoryResponse: {
              searchTotal: 0,
              more: false,
            },
          },
        });
      },
    ),
  );
}

type InitializedDomainsBody = { domainName?: string };

/**
 * Setup MSW handler for the getInitializedDomains extension endpoint, which
 * drives the INIT / RE-INIT DOMAIN button state.
 */
function setupInitializedDomainsHandler(
  options: {
    initialized?: boolean;
    onInitializedDomainsRequest?: (body: InitializedDomainsBody) => void;
  } = {},
): void {
  const { initialized = false, onInitializedDomainsRequest } = options;
  worker.use(
    http.post<never, InitializedDomainsBody>(
      '/service/extension/zextras_admin/admin/getInitializedDomains',
      async ({ request }) => {
        const body = (await request.json()) as InitializedDomainsBody;
        onInitializedDomainsRequest?.(body);
        const domain = initialized ? [{ name: DOMAIN_NAME, id: DOMAIN_ID }] : [];
        return HttpResponse.json({ domain, searchTotal: domain.length });
      },
    ),
  );
}

function setupGlobalAdminSettings(queryClient: QueryClient): void {
  queryClient.setQueryData(['account', 'settings'], {
    prefs: {},
    attrs: { zimbraIsAdminAccount: 'TRUE' },
    props: [],
  });
}

describe('ManageDelegates (browser)', () => {
  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedNotSupported();
  });

  describe('Rendering', () => {
    it('should render the Delegated Domain Admins title', async () => {
      setupSearchDirectoryHandler();
      await setupBrowserTest(<ManageDelegates />);
      await expect
        .element(page.getByText('Delegated Domain Admins', { exact: true }))
        .toBeInTheDocument();
    });

    it('should render the Administration Rights subtitle', async () => {
      setupSearchDirectoryHandler();
      await setupBrowserTest(<ManageDelegates />);
      await expect
        .element(page.getByText('Administration Rights', { exact: true }))
        .toBeInTheDocument();
    });
  });

  describe('Table', () => {
    it('should render the Account column header', async () => {
      setupSearchDirectoryHandler();
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('Account', { exact: true })).toBeInTheDocument();
    });

    it('should display delegate account names in the table', async () => {
      setupSearchDirectoryHandler();
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('delegated1@example.com')).toBeInTheDocument();
      await expect.element(page.getByText('delegated2@example.com')).toBeInTheDocument();
      await expect.element(page.getByText('globaladmin@example.com')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty list message when no delegate accounts exist', async () => {
      setupSearchDirectoryHandler([]);
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
    });

    it('should show suggestion text to create account when list is empty', async () => {
      setupSearchDirectoryHandler([]);
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText(/Create/)).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should show pagination when accounts are present', async () => {
      setupSearchDirectoryHandler();
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('delegated1@example.com')).toBeInTheDocument();
      // Paging component renders page numbers
      await expect.element(page.getByText('1', { exact: true }).first()).toBeInTheDocument();
    });

    it('should not show pagination when no accounts exist', async () => {
      setupSearchDirectoryHandler([]);
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
    });
  });

  describe('Global Admin features', () => {
    it('should not show INIT DOMAIN button for non-admin users', async () => {
      setupSearchDirectoryHandler();
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('delegated1@example.com')).toBeInTheDocument();
      await expect.element(page.getByText('INIT DOMAIN', { exact: true })).not.toBeInTheDocument();
    });

    it('should show INIT DOMAIN button for global admin users', async () => {
      setupSearchDirectoryHandler();
      setupInitializedDomainsHandler({ initialized: false });
      const qc = getQueryClient();
      setupGlobalAdminSettings(qc);
      await setupBrowserTest(<ManageDelegates />, { queryClient: qc });
      await expect.element(page.getByText('INIT DOMAIN', { exact: true })).toBeInTheDocument();
    });

    it('should show RE-INIT DOMAIN button when domain is already initialized', async () => {
      setupSearchDirectoryHandler();
      setupInitializedDomainsHandler({ initialized: true });
      const qc = getQueryClient();
      setupGlobalAdminSettings(qc);
      await setupBrowserTest(<ManageDelegates />, { queryClient: qc });
      await expect.element(page.getByText('RE-INIT DOMAIN', { exact: true })).toBeInTheDocument();
    });
  });

  describe('Edit account modal', () => {
    it('should open the EditAccount view in a modal when a row is clicked', async () => {
      setupSearchDirectoryHandler();
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('delegated1@example.com')).toBeInTheDocument();

      await userEvent.click(page.getByText('delegated1@example.com'));

      await expect.element(page.getByText('EDIT-ACCOUNT-VIEW')).toBeVisible();
    });
  });

  describe('Init domain action', () => {
    const initCalls: Array<{ domain?: string }> = [];
    const grantRightCalls: Array<{
      target?: { _content?: string };
      grantee?: { _content?: string };
      right?: { _content?: string };
    }> = [];

    type GrantRightSoapBody = {
      Body?: {
        GrantRightRequest?: {
          target?: { _content?: string };
          grantee?: { _content?: string };
          right?: { _content?: string };
        };
      };
    };

    function setupGlobalAdminWithCosLimits(): QueryClient {
      const qc = getQueryClient();
      setupGlobalAdminSettings(qc);
      return qc;
    }

    const COS_LIMIT_ATTRS: Array<{ n: string; _content: string }> = [
      { n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-a:50' },
      { n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-b:100' },
    ];

    it('should initialize the domain and grant COS rights to helpdesk admins', async () => {
      setupSearchDirectoryHandler();
      setupInitializedDomainsHandler({ initialized: false });
      const qc = setupGlobalAdminWithCosLimits();
      worker.use(
        http.post('/service/extension/zextras_admin/admin/initDomainForDelegation', async ({ request }) => {
          initCalls.push((await request.json()) as { domain?: string });
          return HttpResponse.json({ message: 'Domain initialized' });
        }),
        http.post('/service/admin/soap/GrantRightRequest', async ({ request }) => {
          const body = (await request.json()) as GrantRightSoapBody;
          if (body?.Body?.GrantRightRequest) {
            grantRightCalls.push(body.Body.GrantRightRequest);
          }
          return HttpResponse.json({ Body: { GrantRightResponse: {} } });
        }),
      );
      await setupBrowserTest(<ManageDelegates />, {
        queryClient: qc,
        extraDomainAttrs: COS_LIMIT_ATTRS,
      });

      await userEvent.click(page.getByRole('button', { name: 'INIT DOMAIN' }));

      await vi.waitFor(() => {
        expect(initCalls).toHaveLength(1);
      });
      expect(initCalls[0]?.domain).toBe(DOMAIN_NAME);

      // 2 COS entries x 3 rights (getCos, listCos, assignCos)
      await vi.waitFor(() => {
        expect(grantRightCalls).toHaveLength(6);
      });
      const grantedRights = grantRightCalls
        .map((call) => `${call.target?._content}:${call.right?._content}`)
        .sort();
      expect(grantedRights).toEqual([
        'cos-a:assignCos',
        'cos-a:getCos',
        'cos-a:listCos',
        'cos-b:assignCos',
        'cos-b:getCos',
        'cos-b:listCos',
      ]);
      grantRightCalls.forEach((call) => {
        expect(call.grantee?._content).toBe(`__helpdesk_admins@${DOMAIN_NAME}`);
      });

      await expect.element(page.getByText('Domain initialized')).toBeVisible();
    });

    it('should show an error snackbar when domain initialization fails', async () => {
      setupSearchDirectoryHandler();
      setupInitializedDomainsHandler({ initialized: false });
      const qc = setupGlobalAdminWithCosLimits();
      worker.use(
        http.post('/service/extension/zextras_admin/admin/initDomainForDelegation', () =>
          HttpResponse.error(),
        ),
      );
      await setupBrowserTest(<ManageDelegates />, {
        queryClient: qc,
        extraDomainAttrs: COS_LIMIT_ATTRS,
      });

      await userEvent.click(page.getByRole('button', { name: 'INIT DOMAIN' }));

      await expect.element(page.getByText('Failed to fetch')).toBeVisible();
    });
  });

  describe('Pagination interactions', () => {
    function buildManyAccounts(count: number): Array<AccountEntry> {
      return Array.from({ length: count }, (_, index) =>
        buildDelegateAccount(`user${index + 1}@${DOMAIN_NAME}`, `many-${index + 1}`),
      );
    }

    it('should re-request accounts with offset 10 when navigating to the next page', async () => {
      const accountsRequests: Array<AccountsRequestParams> = [];
      setupSearchDirectoryHandler(buildManyAccounts(15), {
        onAccountsRequest: (params) => accountsRequests.push(params),
      });
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();

      await userEvent.click(page.getByRole('button', { name: 'Next page' }));

      await vi.waitFor(() => {
        expect(accountsRequests.at(-1)?.offset).toBe(10);
      });
    });

    it('should re-request accounts with the new limit when page size changes', async () => {
      const accountsRequests: Array<AccountsRequestParams> = [];
      setupSearchDirectoryHandler(buildManyAccounts(15), {
        onAccountsRequest: (params) => accountsRequests.push(params),
      });
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();

      await userEvent.click(page.getByTestId('pagination-select').getByText('10', { exact: true }));
      await userEvent.click(page.getByText('25', { exact: true }));

      await vi.waitFor(() => {
        expect(accountsRequests.at(-1)?.limit).toBe(25);
      });
    });
  });

  describe('Loading state', () => {
    it('should show a spinner while the account list is loading', async () => {
      setupSearchDirectoryHandler(DELEGATE_ACCOUNTS, { delayAccountsMs: 5000 });
      await setupBrowserTest(<ManageDelegates />);

      await expect.element(page.getByRole('status')).toBeVisible();
    });
  });

  describe('API interaction', () => {
    it('should request accounts with admin/delegated admin query', async () => {
      let capturedAccountsQuery = '';
      worker.use(
        http.post<never, SearchDirectoryBody>(
          '/service/admin/soap/SearchDirectoryRequest',
          async ({ request }) => {
            const body = await request.json();
            const params = body?.Body?.SearchDirectoryRequest;
            if (params?.types === 'accounts') {
              capturedAccountsQuery = params?.query as string;
            }
            return HttpResponse.json({
              Body: {
                SearchDirectoryResponse: {
                  account: [],
                  dl: [],
                  searchTotal: 0,
                  more: false,
                },
              },
            });
          },
        ),
      );
      await setupBrowserTest(<ManageDelegates />);
      await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
      expect(capturedAccountsQuery).toContain('zimbraIsAdminAccount=TRUE');
      expect(capturedAccountsQuery).toContain('zimbraIsDelegatedAdminAccount=TRUE');
    });

    it('should check the domain initialization state via getInitializedDomains', async () => {
      const capturedBodies: Array<InitializedDomainsBody> = [];
      setupSearchDirectoryHandler();
      setupInitializedDomainsHandler({
        onInitializedDomainsRequest: (body) => capturedBodies.push(body),
      });
      const qc = getQueryClient();
      setupGlobalAdminSettings(qc);
      await setupBrowserTest(<ManageDelegates />, { queryClient: qc });
      await expect.element(page.getByText('delegated1@example.com')).toBeInTheDocument();

      await vi.waitFor(() => {
        expect(capturedBodies.length).toBeGreaterThan(0);
      });
      expect(capturedBodies[0]?.domainName).toBe(DOMAIN_NAME);
    });
  });
});
