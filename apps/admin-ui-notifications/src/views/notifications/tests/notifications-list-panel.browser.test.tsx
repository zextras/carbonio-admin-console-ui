/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import NotificationsListPanel from '../notifications-list-panel';

describe('NotificationsListPanel', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    vi.resetAllMocks();
    queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);
    await grantUserConfigRights(queryClient);
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('should render the Manage section title', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect.element(page.getByText('Manage')).toBeVisible();
  });

  it('should render the List item under Manage', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect.element(page.getByText('List')).toBeVisible();
  });

  it('should show the List item in bold when selected', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect.element(page.getByText('List')).toBeVisible();
    const allDsTexts = document.querySelectorAll('ds-text');
    const listDsText = Array.from(allDsTexts).find((el) => el.textContent?.includes('List'));
    expect(listDsText).toBeTruthy();
    expect(listDsText?.getAttribute('weight')).toBe('bold');
  });

  it('should show ChevronUpOutline icon when Manage is expanded', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    const button = page.getByRole('button').first().element();
    expect(button.innerHTML).toContain('ChevronUpOutline');
  });

  it('should collapse the Manage section when clicked', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect.element(page.getByText('List')).toBeVisible();
    await page.getByText('Manage').click();
    expect(page.getByText('List').elements()).toHaveLength(0);
  });

  it('should show ChevronDownOutline icon when Manage is collapsed', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await page.getByText('Manage').click();
    const button = page.getByRole('button').first().element();
    expect(button.innerHTML).toContain('ChevronDownOutline');
  });

  it('should expand the Manage section when toggled back', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await page.getByText('Manage').click();
    expect(page.getByText('List').elements()).toHaveLength(0);
    await page.getByText('Manage').click();
    await expect.element(page.getByText('List')).toBeVisible();
  });
});
