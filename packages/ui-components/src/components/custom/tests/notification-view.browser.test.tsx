/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserZextrasActionInterceptor,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { NotificationView } from '../notification-view';

type MockNotification = {
  id: string;
  server: string;
  date: number;
  level: string;
  subject: string;
  text: string;
  ack: boolean;
  group: string;
  operationId: string;
};

function createMockNotifications(count: number): Array<MockNotification> {
  const levels = ['Information', 'Warning', 'Error'];
  return Array.from({ length: count }, (_, i) => ({
    id: `notif-${i + 1}`,
    server: `server${i + 1}.test.com`,
    date: 1700000000000 + i * 1000,
    level: levels[i % 3],
    subject: `Subject-${String(i + 1).padStart(3, '0')}`,
    text: `Text ${i + 1}`,
    ack: i % 2 === 0,
    group: 'group',
    operationId: `op-${i + 1}`,
  }));
}

function createNotificationsResponse(notifications: Array<MockNotification>) {
  return () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({
            ok: true,
            response: { notifications },
          }),
        },
      },
    });
}

async function setupNotificationViewTest(notifications: Array<MockNotification>) {
  createBrowserZextrasActionInterceptor(
    'getAllNotifications',
    createNotificationsResponse(notifications),
  );

  await setupBrowserTest(<NotificationView isShowTitle={false} />);
}

describe('NotificationView', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders pagination controls when notifications exist', async () => {
    await setupNotificationViewTest(createMockNotifications(15));

    await expect.element(page.getByText(/items per page/i)).toBeVisible();
    await expect.element(page.getByText('1 of 2')).toBeVisible();
  });

  it('does not render pagination controls when no notifications', async () => {
    await setupNotificationViewTest([]);

    await expect.element(page.getByText('Server')).toBeVisible();
    expect(page.getByText(/items per page/i).elements().length).toBe(0);
  });

  it('limits displayed rows to the first page', async () => {
    await setupNotificationViewTest(createMockNotifications(15));

    await expect.element(page.getByText('Subject-015')).toBeVisible();
    await expect.element(page.getByText('Subject-006')).toBeVisible();
    expect(page.getByText('Subject-005').elements().length).toBe(0);
  });

  it('resets pagination when switching filter tabs', async () => {
    await setupNotificationViewTest(createMockNotifications(15));

    await expect.element(page.getByText('1 of 2')).toBeVisible();

    const nextButton = page.getByRole('button', { name: 'Next page' });
    await nextButton.click();
    await expect.element(page.getByText('2 of 2')).toBeVisible();

    await page.getByText(/WARNING \(.*\)/).click();

    await expect.element(page.getByText('1 of 1')).toBeVisible();
  });
});
