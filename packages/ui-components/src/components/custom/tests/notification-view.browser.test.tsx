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

type SoapActionBody = {
  Body?: {
    zextras?: {
      notificationId?: string;
      key?: string;
      value?: boolean;
    };
  };
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

function setupSetNotificationAttrInterceptor() {
  return createBrowserZextrasActionInterceptor('setNotificationAttr', () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({ ok: true }),
        },
      },
    }),
  );
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

  it('shows per-level counts on filter tabs', async () => {
    await setupNotificationViewTest(createMockNotifications(15));

    await expect.element(page.getByText(/ALL \(15\)/)).toBeVisible();
    await expect.element(page.getByText(/INFORMATION \(5\)/)).toBeVisible();
    await expect.element(page.getByText(/WARNING \(5\)/)).toBeVisible();
    await expect.element(page.getByText(/ERROR \(5\)/)).toBeVisible();
  });

  it('filters rows by level when a tab is selected', async () => {
    await setupNotificationViewTest(createMockNotifications(15));

    await page.getByText(/WARNING \(.*\)/).click();

    // Warning items are the indexes i where i % 3 === 1.
    await expect.element(page.getByText('Subject-002')).toBeVisible();
    await expect.element(page.getByText('Subject-008')).toBeVisible();
    expect(page.getByText('Subject-001').elements().length).toBe(0);
    expect(page.getByText('Subject-003').elements().length).toBe(0);
  });

  it('marks a notification as unread from the detail modal', async () => {
    const ackInterceptor = setupSetNotificationAttrInterceptor();
    await setupNotificationViewTest(createMockNotifications(15));

    // Notifications are sorted by date descending: notif-15 (ack=true) is the first row.
    await page.getByText('Subject-015').dblClick();

    await expect.element(page.getByText(/Notification Details/i)).toBeVisible();

    await page.getByRole('button', { name: 'Mark as unread' }).click();

    await expect.element(
      page.getByText('Notification mark as unread successfully'),
    ).toBeVisible();

    const lastRequest = ackInterceptor.getLastRequestBody<SoapActionBody>();
    expect(lastRequest?.Body?.zextras?.notificationId).toBe('notif-15');
    expect(lastRequest?.Body?.zextras?.key).toBe('ack');
    expect(lastRequest?.Body?.zextras?.value).toBe(false);
  });

  it('silently marks an unread notification as read on row click', async () => {
    const ackInterceptor = setupSetNotificationAttrInterceptor();
    await setupNotificationViewTest(createMockNotifications(15));

    // notif-14 has ack=false (i % 2 === 1) and is on the first page.
    await page.getByText('Subject-014').click();

    await expect.element(page.getByText(/Notification Details/i)).toBeVisible();
    expect(
      page.getByText('Notification mark as read successfully').elements().length,
    ).toBe(0);

    await vi.waitFor(() => {
      expect(ackInterceptor.getCalledTimes()).toBeGreaterThan(0);
    });
    const lastRequest = ackInterceptor.getLastRequestBody<SoapActionBody>();
    expect(lastRequest?.Body?.zextras?.notificationId).toBe('notif-14');
    expect(lastRequest?.Body?.zextras?.key).toBe('ack');
    expect(lastRequest?.Body?.zextras?.value).toBe(true);
  });

  it('shows an error snackbar when fetching notifications fails', async () => {
    // A network-level failure makes the query reject; the snackbar shows the
    // transport error message ("Failed to fetch" in Chromium).
    createBrowserZextrasActionInterceptor('getAllNotifications', () => HttpResponse.error());

    await setupBrowserTest(<NotificationView isShowTitle={false} />);

    await expect.element(page.getByText('Failed to fetch')).toBeVisible();
  }, 20_000);
});
