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
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { type ZextrasRequestBody } from '../../src/types/notifications';
import { AppView } from '../../src/views/app-view';

function setupGetAllNotificationsInterceptor(): void {
  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as ZextrasRequestBody;
      const zextrasBody = body?.Body?.zextras;

      if (zextrasBody?.action === 'getAllNotifications') {
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: { notifications: [] },
              }),
            },
          },
        });
      }

      return HttpResponse.json({ Body: {} });
    }),
  );
}

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    vi.resetAllMocks();
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('should render the Breadcrumb component', async () => {
    setupGetAllNotificationsInterceptor();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/list',
      queryClient,
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('should render the Manage section with List option in the list panel', async () => {
    setupGetAllNotificationsInterceptor();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/list',
      queryClient,
    });

    await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
    await expect.element(page.getByText('List', { exact: true })).toBeVisible();
  });

  it('should highlight the List item as selected when on the /list route', async () => {
    setupGetAllNotificationsInterceptor();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/list',
      queryClient,
    });

    await expect.element(page.getByText('List')).toBeVisible();
    const allDsTexts = document.querySelectorAll('ds-text');
    const listDsText = Array.from(allDsTexts).find((el) => el.textContent?.includes('List'));
    expect(listDsText).toBeTruthy();
    expect(listDsText?.getAttribute('weight')).toBe('bold');
  });
}, 20_000);
