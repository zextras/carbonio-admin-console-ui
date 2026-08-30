/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DashboardDataTableShowcase } from '../dashboard-data-table-showcase';

async function setupShowcaseTest() {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['notifications'], []);
  await setupBrowserTest(<DashboardDataTableShowcase />, { queryClient });
}

describe('DashboardDataTableShowcase', () => {
  it('renders the panel with the showcase title and demo rows', async () => {
    await setupShowcaseTest();
    await expect.element(page.getByText('New table (showcase)')).toBeVisible();
    await expect.element(page.getByRole('columnheader', { name: /Type/ })).toBeVisible();
    await expect.element(page.getByRole('cell', { name: 'Mailbox quota exceeded', exact: true })).toBeVisible();
  });

  it('sorts by date when clicking the date header', async () => {
    await setupShowcaseTest();
    await expect
      .element(page.getByRole('cell', { name: 'Mailbox quota exceeded', exact: true }))
      .toBeVisible();
    await userEvent.click(page.getByRole('button', { name: /Date/ }));
    await expect
      .element(page.getByRole('columnheader', { name: /Date/ }))
      .toHaveAttribute('aria-sort', 'descending');
  });

  it('filters rows via the global filter', async () => {
    await setupShowcaseTest();
    await expect
      .element(page.getByRole('cell', { name: 'Mailbox quota exceeded', exact: true }))
      .toBeVisible();
    await userEvent.fill(page.getByRole('textbox', { name: 'Search' }), 'certificate');
    await expect
      .element(page.getByRole('cell', { name: 'Certificate expiring soon', exact: true }))
      .toBeVisible();
    expect((await page.getByRole('row').all()).length).toBe(3);
  });

  it('selects rows and shows the selection count', async () => {
    await setupShowcaseTest();
    await userEvent.click(page.getByRole('checkbox', { name: 'Select row 1' }));
    await expect.element(page.getByText('1 selected')).toBeVisible();
  });

  it('paginates through demo rows', async () => {
    await setupShowcaseTest();
    await expect.element(page.getByText('1 of 3')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Next page' }));
    await expect.element(page.getByText('2 of 3')).toBeVisible();
  });

  it('groups rows by type when the group toggle is clicked', async () => {
    await setupShowcaseTest();
    await userEvent.click(page.getByRole('button', { name: /Group by type/ }));
    await expect.element(page.getByRole('cell', { name: 'Error' })).toBeVisible();
    await expect.element(page.getByRole('cell', { name: 'Warning' })).toBeVisible();
  });

  it('opens the notification detail modal with the message when a row is clicked', async () => {
    await setupShowcaseTest();
    await userEvent.click(
      page.getByRole('cell', { name: 'Mailbox quota exceeded', exact: true }),
    );
    await expect
      .element(page.getByRole('heading', { name: /Notification Details/ }))
      .toBeVisible();
    await userEvent.click(page.getByTestId('icon: CloseOutline'));
    expect((await page.getByRole('heading', { name: /Notification Details/ }).all()).length).toBe(
      0,
    );
  });
});
