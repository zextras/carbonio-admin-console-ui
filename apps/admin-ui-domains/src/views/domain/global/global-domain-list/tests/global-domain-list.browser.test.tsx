/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return { ...actual, replaceHistory: vi.fn() };
});

import { replaceHistory } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
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
      const params = (body as any).Body?.SearchDirectoryRequest ?? {};
      return HttpResponse.json({
        Body: { SearchDirectoryResponse: handler(params as SearchDirectoryParams) },
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

    it('falls back to Active for an unknown status without crashing', async () => {
      interceptDomains([buildDomain('weird.com', 'domain-x', 'totally-unknown-status')]);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('weird.com')).toBeVisible();
      await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
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
    it('navigates to domain details when clicking a domain row', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();

      await page.getByText('example.com').click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith('/domain-1/general_settings');
    });
  });

  describe('Pagination', () => {
    it('shows pagination footer when domains exist', async () => {
      interceptDomains(SAMPLE_DOMAINS, 2);
      setup(<GlobalDomainList />);

      await expect.element(page.getByText('example.com')).toBeVisible();
      await expect.element(page.getByText(/of \d+/)).toBeVisible();
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

      await page.getByTestId('next-page').click();

      await expect.element(page.getByText('beta-11.com')).toBeVisible();
    }, 15_000);
  });
});
