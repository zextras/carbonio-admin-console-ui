/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest as _setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import DomainMailingList from '../domain-mailing-list';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setupBrowserTest(ui: ReactElement): Promise<RenderResult> {
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
  });
  return _setupBrowserTest(ui, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
}

type DlAttribute = { n: string; _content: string };

type DlEntry = {
  name: string;
  id: string;
  dynamic: boolean;
  a: Array<DlAttribute>;
};

function buildDistributionList(
  email: string,
  id: string,
  overrides: {
    displayName?: string;
    mailStatus?: string;
    hideInGal?: string;
    description?: string;
    dynamic?: boolean;
  } = {},
): DlEntry {
  const {
    displayName = email.split('@')[0],
    mailStatus = 'enabled',
    hideInGal = 'FALSE',
    description = '',
    dynamic = false,
  } = overrides;
  return {
    name: email,
    id,
    dynamic,
    a: [
      { n: 'displayName', _content: displayName },
      { n: 'zimbraMailStatus', _content: mailStatus },
      { n: 'zimbraHideInGal', _content: hideInGal },
      { n: 'description', _content: description },
      { n: 'zimbraId', _content: id },
    ],
  };
}

const DISTRIBUTION_LISTS: Array<DlEntry> = [
  buildDistributionList('team@example.com', 'dl-1', {
    displayName: 'Team List',
    mailStatus: 'enabled',
    description: 'Team mailing list',
  }),
  buildDistributionList('news@example.com', 'dl-2', {
    displayName: 'News List',
    mailStatus: 'disabled',
    hideInGal: 'TRUE',
    description: 'Newsletter',
    dynamic: true,
  }),
  buildDistributionList('support@example.com', 'dl-3', {
    displayName: 'Support List',
    mailStatus: 'enabled',
    description: 'Support channel',
  }),
];

function setupSearchDirectoryInterceptor(
  dlList: Array<DlEntry> = DISTRIBUTION_LISTS,
): Promise<unknown> {
  return createBrowserSoapAPIInterceptor('SearchDirectory', {
    dl: dlList,
    searchTotal: dlList.length,
    more: false,
  });
}

describe('DomainMailingList (browser)', () => {
  describe('Rendering', () => {
    it('should render the Distribution List title', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect
        .element(page.getByText('Distribution List', { exact: true }))
        .toBeInTheDocument();
    });

    it('should render the add button (+)', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      const buttons = page.getByRole('button');
      await expect.element(buttons.first()).toBeInTheDocument();
    });

    it('should render the search input', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('team@example.com')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Search…')).toBeInTheDocument();
    });
  });

  describe('Table headers', () => {
    it('should render the DisplayName column header', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('DisplayName', { exact: true })).toBeInTheDocument();
    });

    it('should render the Address column header', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('Address', { exact: true })).toBeInTheDocument();
    });

    it('should render the Status column header', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('Status', { exact: true })).toBeInTheDocument();
    });

    it('should render the Dynamic column header', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('Dynamic', { exact: true })).toBeInTheDocument();
    });

    it('should render the GAL column header', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('GAL', { exact: true })).toBeInTheDocument();
    });

    it('should render the Description column header', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect
        .element(page.getByText('Description', { exact: true }).first())
        .toBeInTheDocument();
    });
  });

  describe('List with data', () => {
    it('should display distribution list display names', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('Team List')).toBeInTheDocument();
      await expect.element(page.getByText('News List')).toBeInTheDocument();
      await expect.element(page.getByText('Support List')).toBeInTheDocument();
    });

    it('should display distribution list addresses', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('team@example.com')).toBeInTheDocument();
      await expect.element(page.getByText('news@example.com')).toBeInTheDocument();
      await expect.element(page.getByText('support@example.com')).toBeInTheDocument();
    });

    it('should display Can Receive status for enabled lists', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect
        .element(page.getByText('Can Receive', { exact: true }).first())
        .toBeInTheDocument();
    });

    it("should display Can't Receive status for disabled lists", async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect
        .element(page.getByText("Can't Receive", { exact: true }).first())
        .toBeInTheDocument();
    });

    it('should display Yes for dynamic lists and No for static lists', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('Yes', { exact: true }).first()).toBeInTheDocument();
      await expect.element(page.getByText('No', { exact: true }).first()).toBeInTheDocument();
    });

    it('should display descriptions', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('Team mailing list')).toBeInTheDocument();
      await expect.element(page.getByText('Newsletter')).toBeInTheDocument();
      await expect.element(page.getByText('Support channel')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty list message when no distribution lists exist', async () => {
      setupSearchDirectoryInterceptor([]);
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
    });

    it('should show suggestion text to create a distribution list', async () => {
      setupSearchDirectoryInterceptor([]);
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText(/Distribution List/)).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should allow typing in the search input', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('team@example.com')).toBeInTheDocument();
      const searchInput = page.getByLabelText('Search…');
      await userEvent.type(searchInput, 'team');
      await expect.element(searchInput).toHaveValue('team');
    });

    it('should disable search input when list is empty and no search active', async () => {
      setupSearchDirectoryInterceptor([]);
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
      const searchInput = page.getByLabelText('Search…');
      await expect.element(searchInput).toHaveAttribute('disabled');
    });
  });

  describe('API interaction', () => {
    it('should send SearchDirectory request with distributionlists type', async () => {
      const interceptor = setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      const params = await interceptor;
      expect(params).toHaveProperty('types', 'distributionlists,dynamicgroups');
    });

    it('should send SearchDirectory request with domain name', async () => {
      const interceptor = setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      const params = await interceptor;
      expect(params).toHaveProperty('domain', DOMAIN_NAME);
    });

    it('should exclude admin groups from the query', async () => {
      const interceptor = setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      const params = await interceptor;
      expect((params as { query: string }).query).toContain('!(zimbraIsAdminGroup=TRUE)');
    });
  });

  describe('Row interactions', () => {
    it('opens the edit view when a row is single-clicked', async () => {
      setupSearchDirectoryInterceptor();
      createBrowserSoapAPIInterceptor('GetDistributionList', {
        dl: [
          {
            id: 'dl-1',
            name: 'team@example.com',
            dlm: [{ _content: 'user1@example.com' }],
            a: [{ n: 'zimbraMailStatus', _content: 'enabled' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('GetDistributionListMembership', { dl: [] });
      createBrowserSoapAPIInterceptor('GetGrants', { grant: [] });
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('team@example.com')).toBeInTheDocument();
      await page.getByText('team@example.com').click();
      // the single-click fires after a 300ms double-click detection window
      await new Promise((resolve) => setTimeout(resolve, 500));
      await expect.element(page.getByText('GENERAL', { exact: true })).toBeInTheDocument();
    });
  });

  describe('Errors', () => {
    it('shows an error snackbar when the list search fails', async () => {
      worker.use(
        http.post('/service/admin/soap/SearchDirectoryRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Search failed' } } } },
            { status: 500 },
          ),
        ),
      );
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('Search failed')).toBeInTheDocument();
    });
  });

  describe('Pagination and creation', () => {
    it('should open the create wizard when the add button is clicked', async () => {
      setupSearchDirectoryInterceptor();
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('team@example.com')).toBeInTheDocument();
      await page.getByTestId('icon: Plus').click();
      await expect.element(page.getByText('New Distribution List')).toBeInTheDocument();
    });

    it('should request the next page when paging forward', async () => {
      const manyLists = Array.from({ length: 15 }, (_, index) =>
        buildDistributionList(`list${index}@example.com`, `dl-${index}`),
      );
      const interceptor = createBrowserSoapAPIInterceptor('SearchDirectory', {
        dl: manyLists,
        searchTotal: manyLists.length,
        more: false,
      });
      await setupBrowserTest(<DomainMailingList />);
      await expect.element(page.getByText('list0@example.com')).toBeInTheDocument();
      await interceptor;
      const secondCall = createBrowserSoapAPIInterceptor('SearchDirectory', {
        dl: manyLists,
        searchTotal: manyLists.length,
        more: false,
      });
      await page.getByRole('button', { name: 'Next page' }).click();
      const params = await secondCall;
      expect(params).toHaveProperty('offset', 10);
    });
  });
});
