/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useSnackbar } from '../hooks/useSnackbar';
import { getAllNotifications, readUnreadNotification } from '../services/notification-service';

export type Notification = {
	ack: boolean;
	date: number;
	group: string;
	id: string;
	level: string;
	operationId: string;
	server: string;
	subject: string;
	text: string;
};

type NotificationsSoapResponse = {
	Body?: {
		response?: {
			content?: string;
		};
	};
};

type NotificationsContent = {
	ok?: boolean;
	message?: string;
	response?: {
		notifications?: Array<Notification>;
	};
};

type ReadUnreadNotificationVariables = {
	notification: Notification;
	showMessage?: boolean;
};

export const notificationsQueryKeys = {
	all: ['notifications'] as const,
} as const;

function parseSoapContent(res: NotificationsSoapResponse): NotificationsContent {
	return JSON.parse(res?.Body?.response?.content ?? '{}') as NotificationsContent;
}

async function fetchAllNotifications(): Promise<Array<Notification>> {
	const res = (await getAllNotifications()) as NotificationsSoapResponse;
	const content = parseSoapContent(res);
	const notifications = content.response?.notifications ?? [];
	return [...notifications].sort((a, b) => b.date - a.date);
}

export const useAllNotifications = () => {
	return useQuery({
		queryKey: notificationsQueryKeys.all,
		queryFn: fetchAllNotifications,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useReadUnreadNotification = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ notification }: ReadUnreadNotificationVariables) => {
			const res = (await readUnreadNotification(
				notification.id,
				!notification.ack,
			)) as NotificationsSoapResponse;
			const content = parseSoapContent(res);
			if (!content.ok) {
				throw new Error(content.message ?? 'setNotificationAttr failed');
			}
			return content;
		},
		onSuccess: (_content, variables) => {
			if (variables.showMessage !== false) {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: variables.notification.ack
						? t(
								'notification.notification_mark_unread_successfully',
								'Notification mark as unread successfully',
							)
						: t(
								'notification.notification_mark_read_successfully',
								'Notification mark as read successfully',
							),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true,
				});
			}
			void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
		},
		onError: (error: Error) => {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label:
					error?.message ||
					t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true,
			});
		},
	});
};
