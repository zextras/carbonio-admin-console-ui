/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resetMockWorker, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import NotificationListView from '../notification-list-view';

const MOCK_NOTIFICATIONS = [
	{
		id: 'notif-1',
		server: 'mailstore1.test.com',
		date: 1742774400000,
		level: 'Warning',
		subject: 'Disk space low',
		text: 'Disk space is running low on server mailstore1',
		ack: false,
		group: 'system',
		operationId: 'op-1',
	},
	{
		id: 'notif-2',
		server: 'mailstore2.test.com',
		date: 1742688000000,
		level: 'Error',
		subject: 'Service unavailable',
		text: 'IMAP service is down on mailstore2',
		ack: true,
		group: 'system',
		operationId: 'op-2',
	},
	{
		id: 'notif-3',
		server: 'mailstore1.test.com',
		date: 1742601600000,
		level: 'Information',
		subject: 'Backup completed',
		text: 'Full backup completed successfully',
		ack: true,
		group: 'backup',
		operationId: 'op-3',
	},
];

function setupGetAllNotificationsInterceptor(
	notifications: typeof MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS,
): void {
	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as any;
			const zextrasBody = body?.Body?.zextras;

			if (zextrasBody?.action === 'getAllNotifications') {
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								response: {
									notifications,
								},
							}),
						},
					},
				});
			}

			return HttpResponse.json({ Body: {} });
		}),
	);
}

describe('NotificationListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		resetMockWorker();
	});

	it('should render the Notifications List title', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationListView />);
		await expect.element(page.getByText("Notifications' List")).toBeVisible();
	});

	it('should render all notification tabs', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationListView />);
		await expect.element(page.getByText('ALL')).toBeVisible();
		await expect.element(page.getByText('INFORMATION')).toBeVisible();
		await expect.element(page.getByText('WARNING')).toBeVisible();
		await expect.element(page.getByText('ERROR')).toBeVisible();
	});

	it('should render table headers', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationListView />);
		await expect.element(page.getByText('Server')).toBeVisible();
		await expect.element(page.getByText('Date')).toBeVisible();
		await expect.element(page.getByText('Type')).toBeVisible();
		await expect.element(page.getByText("What's inside?")).toBeVisible();
	});

	it('should display notification data in the table', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationListView />);
		await expect.element(page.getByText('mailstore1.test.com').first()).toBeVisible();
		await expect.element(page.getByText('mailstore2.test.com')).toBeVisible();
		await expect.element(page.getByText('Disk space low')).toBeVisible();
		await expect.element(page.getByText('Service unavailable')).toBeVisible();
		await expect.element(page.getByText('Backup completed')).toBeVisible();
	});

	it('should display notification counts in tabs', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationListView />);
		await expect.element(page.getByText(/ALL \(3\)/)).toBeVisible();
		await expect.element(page.getByText(/INFORMATION \(1\)/)).toBeVisible();
		await expect.element(page.getByText(/WARNING \(1\)/)).toBeVisible();
		await expect.element(page.getByText(/ERROR \(1\)/)).toBeVisible();
	});

	it('should render empty table when no notifications', async () => {
		setupGetAllNotificationsInterceptor([]);
		await setupBrowserTest(<NotificationListView />);
		await expect.element(page.getByText("Notifications' List")).toBeVisible();
		await expect.element(page.getByText(/ALL \(0\)/)).toBeVisible();
	});
});
