/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type QuotaNotificationTarget = 'accounts' | 'cos';

export type QuotaNotificationSourceType = 'ACCOUNT' | 'COS' | 'DEFAULT';

export type QuotaNotificationSource = {
	type: QuotaNotificationSourceType;
	/** Present only when `type` is `COS`. */
	id?: string;
	/** Present only when `type` is `COS`. */
	name?: string;
};

export type QuotaNotificationIntervalDays = 1 | 7 | 14 | 30;

export type QuotaNotificationContentValue = {
	subject: string;
	body: string;
	source: QuotaNotificationSource;
};

export type QuotaNotificationContent = QuotaNotificationContentValue & {
	/** Value and source the target would have without its own override. */
	inherited: QuotaNotificationContentValue;
};

export type QuotaNotificationIntervalValue = {
	days: number;
	source: QuotaNotificationSource;
};

export type QuotaNotificationInterval = QuotaNotificationIntervalValue & {
	/** Value and source the target would have without its own override. */
	inherited: QuotaNotificationIntervalValue;
};

export type QuotaNotificationConfig = {
	content: QuotaNotificationContent;
	interval: QuotaNotificationInterval;
};

export type QuotaNotificationErrorCode =
	| 'REQUIRED'
	| 'TOO_LONG'
	| 'FORBIDDEN_CHARACTER'
	| 'UNKNOWN_PLACEHOLDER'
	| 'INVALID_INTERVAL';

export type QuotaNotificationErrorField = 'content.subject' | 'content.body' | 'interval';

export type QuotaNotificationFieldError = {
	field: QuotaNotificationErrorField;
	code: QuotaNotificationErrorCode;
	detail?: string;
};

export type QuotaNotificationPlaceholder = 'usedQuota' | 'quotaLimit' | 'displayName' | 'email';
