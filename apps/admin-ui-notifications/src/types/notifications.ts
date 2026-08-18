/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type { Notification } from '@zextras/ui-shared';

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
