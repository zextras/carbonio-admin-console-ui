/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { QuotaNotificationIntervalDays, QuotaNotificationPlaceholder } from './types';

export const QUOTA_NOTIFICATION_SUBJECT_MAX_LENGTH = 150;
export const QUOTA_NOTIFICATION_BODY_MAX_LENGTH = 2000;

/** The character counter becomes visible from this fraction of the limit. */
export const QUOTA_NOTIFICATION_COUNTER_THRESHOLD = 0.9;

export const QUOTA_NOTIFICATION_INTERVALS: ReadonlyArray<QuotaNotificationIntervalDays> = [
	1, 7, 14, 30,
];

export const QUOTA_NOTIFICATION_PLACEHOLDERS: ReadonlyArray<QuotaNotificationPlaceholder> = [
	'usedQuota',
	'quotaLimit',
	'displayName',
	'email',
];

export function getQuotaNotificationPlaceholderToken(
	placeholder: QuotaNotificationPlaceholder,
): string {
	return `{{${placeholder}}}`;
}
