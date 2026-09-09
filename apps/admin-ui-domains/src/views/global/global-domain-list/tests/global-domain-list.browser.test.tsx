/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return { ...actual, replaceHistory: vi.fn() };
});

import { type QueryClient } from '@tanstack/react-query';
import { replaceHistory } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  resetMockWorker,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { GlobalDomainList } from '../global-domain-list';

const mockedReplaceHistory = vi.mocked(replaceHistory);

type DomainAttr = { n: string; _content: string };
type DomainItem = { name: string; id: string; a: DomainAttr[] };

function buildDomain(
  name: string,
  id: string,
  status = 'active',
  extraAttrs: DomainAttr[] = [],
): DomainItem {
  return {
    name,
    id,
    a: [
      { n: 'zimbraDomainStatus', _content: status },
      { n: 'zimbraDomainType', _content: 'local' },
      ...extraAttrs,
    ],
  };
}

function interceptDomains(domains: DomainItem[] = [], searchTotal = domains.length) {
  return createBrowserSoapAPIInterceptor('SearchDirectory', {
    domain: domains,
    searchTotal,
    more: false,
  });
}

type SearchDirectoryParams = {
  query?: { _content?: string };
  offset?: number;
  limit?: number;
};

function interceptDynamicDomains(
  handler: (params: SearchDirectoryParams) => {
    domain: DomainItem[];
    searchTotal: number;
    more: boolean;
  },
): void {
  worker.use(
    http.post('/service/admin/soap/SearchDirectoryRequest', async ({ request }) => {
      const body = await request.clone().json();
      const params =
        (body as { Body?: { SearchDirectoryRequest?: SearchDirectoryParams } }).Body
          ?.SearchDirectoryRequest ?? {};
      return HttpResponse.json({
        Body: { SearchDirectoryResponse: handler(params) },
      });
    }),
  );
}

const SAMPLE_DOMAINS: DomainItem[] = [
  buildDomain('example.com', 'domain-1', 'active'),
  buildDomain('test.org', 'domain-2', 'closed'),
];

function setup(ui: ReactElement) {
  return setupBrowserTest(ui);
}

describe('GlobalDomainList (browser)', () => {
  afterEach(() => {
    resetMockWorker();
    mockedReplaceHistory.mockClear();
  });

  describe('Rendering', () => {
    it('renders the Domains List header', async () => {
      interceptDomains([]);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('Domains List')).toBeVisible();
    });

    it('renders the table column headers', async () => {
      interceptDomains([]);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('Domain Name', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Status', { exact: true })).toBeVisible();
    });

    it('renders the search input', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByLabelText(`I'm looking for this domain…`)).toBeVisible();
    });
  });

  describe('With data', () => {
    it('displays domain names in the table', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();
      await expect.element(page.getByText('test.org')).toBeVisible();
    });

    it('displays domain status labels', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Closed', { exact: true })).toBeVisible();
    });
  });

  describe('Domain statuses', () => {
    it.each([
      ['maintenance', 'In maintenance'],
      ['locked', 'Locked'],
      ['pending', 'Pending'],
      ['lockout', 'Lockout'],
      ['suspended', 'Suspended'],
    ])('displays %s status as "%s"', async (status, expectedLabel) => {
      interceptDomains([buildDomain('status-test.com', 'domain-st', status)]);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText(expectedLabel, { exact: true })).toBeVisible();
    });

    it('defaults to Active when domain has no zimbraDomainStatus attribute', async () => {
      interceptDomains([{ name: 'fallback.com', id: 'domain-fb', a: [] }]);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
    });

    it('falls back to the raw status string for an unknown status without crashing', async () => {
      interceptDomains([buildDomain('weird.com', 'domain-x', 'totally-unknown-status')]);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('weird.com')).toBeVisible();
      await expect
        .element(page.getByText('totally-unknown-status', { exact: true }))
        .toBeVisible();
    });
  });

  describe('Empty state', () => {
    it('shows the empty state message when no domains exist', async () => {
      interceptDomains([], 0);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('This list is empty.')).toBeVisible();
    });
  });

  describe('Error handling', () => {
    it('displays an error snackbar when the API fails', async () => {
      worker.use(
        http.post('/service/admin/soap/SearchDirectoryRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Server error' } } } },
            { status: 500 },
          ),
        ),
      );
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('Server error')).toBeVisible();
    });
  });

  describe('Search', () => {
    it('filters domains based on search input after debounce', async () => {
      interceptDynamicDomains((params) => {
        const queryContent = params?.query?._content ?? '';
        if (queryContent.includes('exam')) {
          return {
            domain: [buildDomain('example.com', 'domain-1', 'active')],
            searchTotal: 1,
            more: false,
          };
        }
        return { domain: SAMPLE_DOMAINS, searchTotal: 2, more: false };
      });
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();
      await expect.element(page.getByText('test.org')).toBeVisible();

      const searchInput = page.getByLabelText(`I'm looking for this domain…`);
      await searchInput.fill('exam');

      await expect.element(page.getByText('example.com')).toBeVisible();
      await expect
        .poll(() => page.getByText('test.org').elements(), { timeout: 5000 })
        .toHaveLength(0);
    }, 15_000);

    it('shows empty state when search returns no matches', async () => {
      interceptDynamicDomains((params) => {
        const queryContent = params?.query?._content ?? '';
        if (queryContent && queryContent !== '') {
          return { domain: [], searchTotal: 0, more: false };
        }
        return { domain: SAMPLE_DOMAINS, searchTotal: 2, more: false };
      });
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();

      const searchInput = page.getByLabelText(`I'm looking for this domain…`);
      await searchInput.fill('xyznomatch');

      await expect.element(page.getByText('This list is empty.')).toBeVisible();
    }, 15_000);
  });

  describe('Navigation', () => {
    it('navigates to domain details from peek Open domain', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();

      await page.getByText('example.com').click();
      await expect
        .element(page.getByRole('complementary', { name: 'Details: example.com' }))
        .toBeVisible();
      await page.getByRole('button', { name: 'Open domain' }).click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith('/domain-1/accounts');
    });

    it('navigates to domain details from row actions', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();
      await page.getByRole('button', { name: /Actions for example.com/ }).click();
      await page.getByRole('menuitem', { name: 'Open domain' }).click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith('/domain-1/accounts');
    });
  });

  describe('Pagination', () => {
    it('shows a result count when below the pagination threshold', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();
      await expect.element(page.getByText('2 results')).toBeVisible();
    });

    it('loads next page of domains when clicking next page', async () => {
      const page1Domains = Array.from({ length: 10 }, (_, i) =>
        buildDomain(`alpha-${i + 1}.com`, `p1-${i + 1}`),
      );
      const page2Domains = Array.from({ length: 10 }, (_, i) =>
        buildDomain(`beta-${i + 11}.com`, `p2-${i + 11}`),
      );

      interceptDynamicDomains((params) => {
        const offset = params?.offset ?? 0;
        if (offset === 0) {
          return { domain: page1Domains, searchTotal: 25, more: true };
        }
        return { domain: page2Domains, searchTotal: 25, more: false };
      });
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('alpha-1.com')).toBeVisible();

      await page.getByRole('button', { name: 'Next page' }).click();

      await expect.element(page.getByText('beta-11.com')).toBeVisible();
    }, 15_000);
  });

  describe('Pagination clamp (#5)', () => {
    it('returns to the last valid page when the server total shrinks', async () => {
      // The view's page size is RECORD_DISPLAY_LIMIT (10), so 60 domains
      // span 6 pages.
      const allDomains = Array.from({ length: 60 }, (_, i) =>
        buildDomain(`clamp-${i + 1}.com`, `clamp-domain-${i + 1}`),
      );
      // Deletions shrink the visible result set under the stale page.
      let visibleDomains = allDomains;
      interceptDynamicDomains((params) => {
        const offset = params?.offset ?? 0;
        const limit = params?.limit ?? 10;
        return {
          domain: visibleDomains.slice(offset, offset + limit),
          searchTotal: visibleDomains.length,
          more: false,
        };
      });
      const queryClient: QueryClient = getQueryClient();
      setupBrowserTest(<GlobalDomainList />, { queryClient });

      await expect.element(page.getByText('clamp-1.com')).toBeVisible();
      await expect.element(page.getByText('1–10 of 60')).toBeVisible();

      await page.getByRole('button', { name: 'Page 6' }).click();
      await expect.element(page.getByText('clamp-51.com')).toBeVisible();
      await expect.element(page.getByText('51–60 of 60')).toBeVisible();

      // Simulate rows deleted elsewhere: the refetch at the stale offset
      // reports the shrunken total. The invalidation mirrors the refresh a
      // view runs after deletions (useDomainSearch caches under the
      // ['domain', 'search-list', …] key).
      visibleDomains = allDomains.slice(0, 30);
      void queryClient.invalidateQueries({ queryKey: ['domain', 'search-list'] });

      // #5 writes the clamped page 3 into state and the offset-20 page is
      // refetched (self-healing clamp) — rows render, not an empty state
      // with a stale footer.
      await expect.element(page.getByText('clamp-21.com')).toBeVisible();
      await expect.element(page.getByText('21–30 of 30')).toBeVisible();
      await expect.element(page.getByText('clamp-51.com')).not.toBeInTheDocument();
      await expect
        .element(page.getByRole('button', { name: 'Page 3' }))
        .toHaveAttribute('aria-current', 'page');
    }, 15_000);
  });

  describe('Bulk selection', () => {
    it('drops the select-all-matching banner and restores the toolbar when sorting clears the selection', async () => {
      const pageDomains = Array.from({ length: 10 }, (_, i) =>
        buildDomain(`bulk-${i + 1}.com`, `bulk-${i + 1}`),
      );
      interceptDynamicDomains(() => ({ domain: pageDomains, searchTotal: 30, more: false }));
      setup(<GlobalDomainList />);

      const searchInput = page.getByLabelText(`I'm looking for this domain…`);
      await expect.element(page.getByText('bulk-1.com')).toBeVisible();
      await expect.element(searchInput).toBeVisible();

      await page.getByRole('checkbox', { name: 'Select all rows on this page' }).click();
      await page.getByRole('button', { name: 'Select all 30 matching' }).click();
      await expect
        .element(page.getByRole('toolbar', { name: 'Bulk actions, 30 selected' }))
        .toBeVisible();
      await expect.element(searchInput).not.toBeInTheDocument();

      // Sorting is a query-shape change: the server table state hook resets
      // the selection while the bulk bar's select-all-matching flag is set.
      await page.getByRole('button', { name: 'Domain Name' }).click();

      await expect
        .element(page.getByRole('toolbar', { name: /Bulk actions/ }))
        .not.toBeInTheDocument();
      await expect.element(searchInput).toBeVisible();
    }, 15_000);
  });
});
