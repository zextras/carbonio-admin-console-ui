/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resetMockWorker, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import NotificationsDetailPanel from '../notifications-detail-panel';

function setupGetAllNotificationsInterceptor(
	notifications: Array<{
		id: string;
		server: string;
		date: number;
		level: string;
		subject: string;
		text: string;
		ack: boolean;
		group: string;
		operationId: string;
	}> = [],
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

describe('NotificationsDetailPanel', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		resetMockWorker();
	});

	it('should render the notification tabs when on list route', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationsDetailPanel />, {
			initialRouterEntry: '/list',
		});
		await expect.element(page.getByText('ALL')).toBeVisible();
		await expect.element(page.getByText('INFORMATION')).toBeVisible();
		await expect.element(page.getByText('WARNING')).toBeVisible();
		await expect.element(page.getByText('ERROR')).toBeVisible();
	});

	it('should render the Notifications List title on list route', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationsDetailPanel />, {
			initialRouterEntry: '/list',
		});
		await expect.element(page.getByText("Notifications' List")).toBeVisible();
	});

	it('should render table headers on list route', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationsDetailPanel />, {
			initialRouterEntry: '/list',
		});
		await expect.element(page.getByText('Server')).toBeVisible();
		await expect.element(page.getByText('Date')).toBeVisible();
		await expect.element(page.getByText('Type')).toBeVisible();
		await expect.element(page.getByText("What's inside?")).toBeVisible();
	});

	it('should render nothing on unknown route', async () => {
		setupGetAllNotificationsInterceptor();
		await setupBrowserTest(<NotificationsDetailPanel />, {
			initialRouterEntry: '/unknown',
		});
		expect(page.getByText("Notifications' List").elements()).toHaveLength(0);
	});
});
