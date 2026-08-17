/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type NotificationLevel = 'Warning' | 'Error' | 'Information';

export type Notification = {
	id: string;
	server: string;
	date: number;
	level: NotificationLevel;
	subject: string;
	text: string;
	ack: boolean;
	group: string;
	operationId: string;
};

export type ManageOption = {
	id: string;
	name: string;
	isSelected: boolean;
};

export type ZextrasRequestBody = {
	Body?: {
		zextras?: {
			action?: string;
		};
	};
};
