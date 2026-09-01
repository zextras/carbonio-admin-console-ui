/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { type DefaultBodyType,http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainListChipInput } from '../parts/domain-list-chip-input';

type SoapRequest = DefaultBodyType & {
  Body?: { SearchDirectoryRequest?: { query?: { _content?: string } } };
};

const DOMAIN_NAME = 'example.com';

const SEARCH_DIRECTORY_RESPONSE = {
  searchTotal: 2,
  more: false,
  domain: [
    { id: 'domain-1', name: 'example.com' },
    { id: 'domain-2', name: 'example.org' },
  ],
};

function trackSearchDirectoryQueries(): { queries: Array<string> } {
  const queries: Array<string> = [];
  worker.use(
    http.post<never, SoapRequest>('/service/admin/soap/SearchDirectoryRequest', async ({ request }) => {
      const body = await request.json();
      queries.push(body?.Body?.SearchDirectoryRequest?.query?._content ?? '');
      return HttpResponse.json({
        Body: { SearchDirectoryResponse: SEARCH_DIRECTORY_RESPONSE },
      });
    }),
  );
  return { queries };
}

async function typeSearch(text: string): Promise<void> {
  const input = page.getByPlaceholder('Search Domain');
  await userEvent.type(input, text);
}

describe('DomainListChipInput (browser)', () => {
  it('should show fetched domain options excluding the current domain', async () => {
    trackSearchDirectoryQueries();
    await setupBrowserTest(
      <DomainListChipInput domainName={DOMAIN_NAME} domainList={[]} setDomainList={() => {}} />,
    );

    await typeSearch('exa');

    await expect.element(page.getByText('example.org')).toBeVisible();
    await expect.element(page.getByText('example.com')).not.toBeInTheDocument();
  });

  it('should reuse the cached query when the same search is typed again', async () => {
    const { queries } = trackSearchDirectoryQueries();
    await setupBrowserTest(
      <DomainListChipInput domainName={DOMAIN_NAME} domainList={[]} setDomainList={() => {}} />,
    );

    await typeSearch('exa');
    await expect.element(page.getByText('example.org')).toBeVisible();

    const input = page.getByPlaceholder('Search Domain');
    await userEvent.clear(input);
    await userEvent.type(input, 'exa');
    await expect.element(page.getByText('example.org')).toBeVisible();

    // Quiet period: any debounced duplicate request would fire within this window
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    expect(queries.filter((query) => query.includes('exa'))).toHaveLength(1);
  });

  it('should not open the dropdown on mount when the domain list cache is warm and no search is typed', async () => {
    // Simulate arriving from the domain list page, which has already fetched
    // the same query key (['domain', 'search-list', '', 10, 0])
    const queryClient = getQueryClient();
    queryClient.setQueryData(['domain', 'search-list', '', 10, 0], SEARCH_DIRECTORY_RESPONSE);

    await setupBrowserTest(
      <DomainListChipInput domainName={DOMAIN_NAME} domainList={[]} setDomainList={() => {}} />,
      { queryClient },
    );

    await expect.element(page.getByPlaceholder('Search Domain')).toBeVisible();

    await expect.element(page.getByText('example.org')).not.toBeInTheDocument();
  });
});
