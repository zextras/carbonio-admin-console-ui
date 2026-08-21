/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type AppRouteDescriptor, useAppStore } from '@zextras/ui-shared';
import {
  getQueryClient,
  grantUserConfigRights,
  LocationDisplay,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { LOG_AND_QUEUES, NOTIFICATION_ROUTE_ID } from '../../../constants';
import { NotificationsListPanel } from '../notifications-list-panel';

const NOTIFICATIONS_BASE = `/${LOG_AND_QUEUES}/${NOTIFICATION_ROUTE_ID}`;

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
    await expect.element(page.getByRole('button', { name: 'Manage' })).toBeVisible();
  });

  it('should render the List item under Manage', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect.element(page.getByRole('button', { name: 'List' })).toBeVisible();
  });

  it('should mark the List item as current when selected', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect
      .element(page.getByRole('button', { name: 'List' }))
      .toHaveAttribute('aria-current', 'true');
  });

  it('should keep the List item bold when selected', async () => {
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

  it('should expose the expanded state on the Manage toggle', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect
      .element(page.getByRole('button', { name: 'Manage' }))
      .toHaveAttribute('aria-expanded', 'true');
  });

  it('should collapse the Manage section when clicked', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect.element(page.getByText('List')).toBeVisible();
    await page.getByRole('button', { name: 'Manage' }).click();
    expect(page.getByText('List').elements()).toHaveLength(0);
  });

  it('should expose the collapsed state on the Manage toggle', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await page.getByRole('button', { name: 'Manage' }).click();
    await expect
      .element(page.getByRole('button', { name: 'Manage' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('should expand the Manage section when toggled back', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await page.getByRole('button', { name: 'Manage' }).click();
    expect(page.getByText('List').elements()).toHaveLength(0);
    await page.getByRole('button', { name: 'Manage' }).click();
    await expect.element(page.getByText('List')).toBeVisible();
  });

  it('should mark List item as current when URL includes the full base path', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: `${NOTIFICATIONS_BASE}/list`,
      queryClient,
    });
    await expect
      .element(page.getByRole('button', { name: 'List' }))
      .toHaveAttribute('aria-current', 'true');
  });

  it('should default selection to List when at the base route without operation', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: NOTIFICATIONS_BASE,
      queryClient,
    });
    await expect
      .element(page.getByRole('button', { name: 'List' }))
      .toHaveAttribute('aria-current', 'true');
  });

  it('should navigate when List item is clicked', async () => {
    useAppStore.getState().setters.addRoute({
      id: NOTIFICATION_ROUTE_ID,
      route: `${LOG_AND_QUEUES}/${NOTIFICATION_ROUTE_ID}`,
      app: LOG_AND_QUEUES,
    } as AppRouteDescriptor);

    await setupBrowserTest(
      <>
        <NotificationsListPanel />
        <LocationDisplay />
      </>,
      {
        initialRouterEntry: NOTIFICATIONS_BASE,
        queryClient,
      },
    );

    await expect.element(page.getByText('List')).toBeVisible();
    await page.getByRole('button', { name: 'List' }).click();
    await expect
      .element(page.getByTestId('location'))
      .toHaveTextContent(`${NOTIFICATIONS_BASE}/list`);
    useAppStore.getState().setters.removeRoute(NOTIFICATION_ROUTE_ID);
  });

  it('should collapse the Manage section when Enter is pressed on the toggle', async () => {
    await setupBrowserTest(<NotificationsListPanel />, {
      initialRouterEntry: '/list',
      queryClient,
    });
    await expect.element(page.getByText('List')).toBeVisible();

    await userEvent.type(page.getByRole('button', { name: 'Manage' }), '{Enter}');

    expect(page.getByText('List').elements()).toHaveLength(0);
  });

  it('should navigate when Enter is pressed on the List item', async () => {
    useAppStore.getState().setters.addRoute({
      id: NOTIFICATION_ROUTE_ID,
      route: `${LOG_AND_QUEUES}/${NOTIFICATION_ROUTE_ID}`,
      app: LOG_AND_QUEUES,
    } as AppRouteDescriptor);

    await setupBrowserTest(
      <>
        <NotificationsListPanel />
        <LocationDisplay />
      </>,
      {
        initialRouterEntry: NOTIFICATIONS_BASE,
        queryClient,
      },
    );

    await expect.element(page.getByText('List')).toBeVisible();
    await userEvent.type(page.getByRole('button', { name: 'List' }), '{Enter}');
    await expect
      .element(page.getByTestId('location'))
      .toHaveTextContent(`${NOTIFICATIONS_BASE}/list`);
    useAppStore.getState().setters.removeRoute(NOTIFICATION_ROUTE_ID);
  });
});
