/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { OperationsLayout } from '../operations-layout';

describe('OperationsLayout', () => {
  it('renders the operations list panel and the outlet content', async () => {
    setupBrowserTest(
      <Routes>
        <Route element={<OperationsLayout />}>
          <Route index element={<div>OUTLET-CHILD</div>} />
        </Route>
      </Routes>,
      { initialRouterEntry: '/' },
    );

    // List panel renders the three operation tabs
    await expect.element(page.getByText('Running')).toBeVisible();
    await expect.element(page.getByText('Queued')).toBeVisible();
    await expect.element(page.getByText('Done')).toBeVisible();

    // Outlet child renders
    await expect.element(page.getByText('OUTLET-CHILD')).toBeVisible();
  });
});
