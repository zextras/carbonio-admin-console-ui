/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getSetupServer } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import React from 'react';

import {
	type Notification,
	notificationsQueryKeys,
	useAllNotifications,
	useReadUnreadNotification,
} from '../use-notifications';

type SoapBody = {
	Body: {
		zextras: {
			action: string;
			notificationId?: string;
			key?: string;
			value?: boolean;
			[key: string]: unknown;
		};
	};
};

function createSoapResponse(content: Record<string, unknown>) {
	return HttpResponse.json({
		Body: {
			response: {
				content: JSON.stringify(content),
			},
		},
	});
}

function interceptSoapAction(
	action: string,
	responseFactory: () => ReturnType<typeof HttpResponse.json>,
) {
	const requests: Array<SoapBody> = [];
	getSetupServer().use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as SoapBody;
			if (body?.Body?.zextras?.action === action) {
				requests.push(body);
				return responseFactory();
			}
			return HttpResponse.json({}, { status: 404 });
		}),
	);
	return { getRequests: () => requests };
}

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
			mutations: { retry: false },
		},
	});
}

function createWrapper(queryClient: QueryClient) {
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

function createNotification(overrides: Partial<Notification> = {}): Notification {
	return {
		ack: false,
		date: 1700000000000,
		group: 'group',
		id: 'notif-1',
		level: 'Information',
		operationId: 'op-1',
		server: 'server1.test.com',
		subject: 'Subject 1',
		text: 'Text 1',
		...overrides,
	};
}

describe('useAllNotifications', () => {
	it('should fetch notifications sorted by date descending', async () => {
		const notifications = [
			createNotification({ id: 'old', date: 1000 }),
			createNotification({ id: 'new', date: 3000 }),
			createNotification({ id: 'middle', date: 2000 }),
		];
		interceptSoapAction('getAllNotifications', () =>
			createSoapResponse({ ok: true, response: { notifications } }),
		);

		const queryClient = createQueryClient();
		const { result } = renderHook(() => useAllNotifications(), {
			wrapper: createWrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.map((item) => item.id)).toEqual(['new', 'middle', 'old']);
	});

	it('should return an empty array when no notifications are present', async () => {
		interceptSoapAction('getAllNotifications', () =>
			createSoapResponse({ ok: true, response: {} }),
		);

		const queryClient = createQueryClient();
		const { result } = renderHook(() => useAllNotifications(), {
			wrapper: createWrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual([]);
	});

	it('should tolerate a missing content payload', async () => {
		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () =>
				HttpResponse.json({ Body: { response: {} } }),
			),
		);

		const queryClient = createQueryClient();
		const { result } = renderHook(() => useAllNotifications(), {
			wrapper: createWrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual([]);
	});
});

describe('useReadUnreadNotification', () => {
	it('should send the ack value and invalidate the notifications query on success', async () => {
		const interceptor = interceptSoapAction('setNotificationAttr', () =>
			createSoapResponse({ ok: true }),
		);

		const queryClient = createQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useReadUnreadNotification(), {
			wrapper: createWrapper(queryClient),
		});

		const notification = createNotification({ id: 'notif-9', ack: false });
		act(() => {
			result.current.mutate({ notification });
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		const request = interceptor.getRequests()[0]?.Body.zextras;
		expect(request?.notificationId).toBe('notif-9');
		expect(request?.key).toBe('ack');
		expect(request?.value).toBe(true);
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: notificationsQueryKeys.all });
	});

	it('should not invalidate the query when the response is not ok', async () => {
		interceptSoapAction('setNotificationAttr', () =>
			createSoapResponse({ ok: false, message: 'boom' }),
		);

		const queryClient = createQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
		const { result } = renderHook(() => useReadUnreadNotification(), {
			wrapper: createWrapper(queryClient),
		});

		act(() => {
			result.current.mutate({ notification: createNotification() });
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error?.message).toBe('boom');
		expect(invalidateSpy).not.toHaveBeenCalled();
	});
});
