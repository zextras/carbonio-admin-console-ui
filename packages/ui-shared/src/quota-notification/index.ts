/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export {
	getQuotaNotificationPlaceholderToken,
	QUOTA_NOTIFICATION_BODY_MAX_LENGTH,
	QUOTA_NOTIFICATION_COUNTER_THRESHOLD,
	QUOTA_NOTIFICATION_INTERVALS,
	QUOTA_NOTIFICATION_PLACEHOLDERS,
	QUOTA_NOTIFICATION_SUBJECT_MAX_LENGTH,
} from './constants';
export {
	deleteQuotaNotificationContent,
	deleteQuotaNotificationInterval,
	getQuotaNotificationConfig,
	putQuotaNotificationContent,
	putQuotaNotificationInterval,
	QuotaNotificationApiError,
} from './quota-notification-service';
export type {
	QuotaNotificationCounter,
	QuotaNotificationField,
	QuotaNotificationValidationError,
} from './quota-notification-validation';
export {
	countCodePoints,
	findUnknownPlaceholder,
	getQuotaNotificationCounter,
	normalizeLineBreaks,
	normalizeNfc,
	QUOTA_NOTIFICATION_FIELD_MAX_LENGTH,
	truncateToCodePoints,
	validateBody,
	validateSubject,
} from './quota-notification-validation';
export type {
	QuotaNotificationConfig,
	QuotaNotificationContent,
	QuotaNotificationContentValue,
	QuotaNotificationErrorCode,
	QuotaNotificationErrorField,
	QuotaNotificationFieldError,
	QuotaNotificationInterval,
	QuotaNotificationIntervalDays,
	QuotaNotificationIntervalValue,
	QuotaNotificationPlaceholder,
	QuotaNotificationSource,
	QuotaNotificationSourceType,
	QuotaNotificationTarget,
} from './types';
export { quotaNotificationQueryKey, useQuotaNotificationConfig } from './use-quota-notification-config';
export type {
	QuotaNotificationContentOption,
	QuotaNotificationFieldErrors,
	QuotaNotificationIntervalChoice,
	QuotaNotificationPartResult,
	QuotaNotificationSaveResult,
	QuotaNotificationState,
} from './use-quota-notification-state';
export { useQuotaNotificationState } from './use-quota-notification-state';
