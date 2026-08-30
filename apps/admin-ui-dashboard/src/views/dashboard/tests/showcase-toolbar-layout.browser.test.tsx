/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';

import { DashboardDataTableShowcase } from '../dashboard-data-table-showcase';

async function setupShowcaseTest() {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['notifications'], []);
  await setupBrowserTest(<DashboardDataTableShowcase />, { queryClient });
}

describe('DashboardDataTableShowcase toolbar layout', () => {
  it('renders the pagination controls inline with the search field', async () => {
    await setupShowcaseTest();
    const search = page.getByRole('textbox', { name: 'Search' });
    await expect.element(search).toBeVisible();
    const firstPageButton = page.getByRole('button', { name: 'First page' });
    await expect.element(firstPageButton).toBeVisible();

    const searchTop = (await search.element())?.getBoundingClientRect().top;
    const firstPageTop = (await firstPageButton.element())?.getBoundingClientRect().top;
    expect(Math.abs((searchTop ?? 0) - (firstPageTop ?? 0))).toBeLessThan(20);
  });
});
