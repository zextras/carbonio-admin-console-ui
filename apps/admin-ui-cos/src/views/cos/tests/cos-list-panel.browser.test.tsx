/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { CosListPanel } from '../cos-list-panel';

const COS_ENTRIES = {
  cos: [
    { id: 'cos-001', name: 'default', a: [] },
    { id: 'cos-002', name: 'workplace', a: [] },
  ],
  searchTotal: 2,
};

async function setupCosListPanelTest(searchDirectoryResponse = COS_ENTRIES): Promise<void> {
  const queryClient = getQueryClient();
  createBrowserSoapAPIInterceptor('SearchDirectory', () => searchDirectoryResponse);
  await setupBrowserTest(
    <Routes>
      <Route path="/*" element={<CosListPanel />} />
    </Routes>,
    { initialRouterEntry: '/manage', queryClient },
  );
  await expect.element(page.getByText('COS List')).toBeVisible();
}

describe('CosListPanel (browser)', () => {
  it('renders the combobox with the select label and the COS options', async () => {
    await setupCosListPanelTest();

    const combobox = page.getByRole('combobox', { name: 'Select a Class of Service' });
    await expect.element(combobox).toBeVisible();

    await combobox.click();

    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'default' })).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'workplace' })).toBeVisible();
  });

  it('shows the not-found description when the search returns no results', async () => {
    await setupCosListPanelTest({ cos: [], searchTotal: 0 });

    const combobox = page.getByRole('combobox', { name: 'Select a Class of Service' });
    await expect.element(combobox).toBeVisible();
    await expect.element(combobox).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(page.getByText('Not found - check the text and try again'))
      .toBeVisible();
  });

  it('fills the input with the picked COS name', async () => {
    await setupCosListPanelTest();

    const combobox = page.getByRole('combobox', { name: 'Select a Class of Service' });
    await combobox.click();
    await page.getByRole('option', { name: 'workplace' }).click();

    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    await expect.element(combobox).toHaveValue('workplace');
  });
});
