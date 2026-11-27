/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type {
  QuotaNotificationField,
  QuotaNotificationIntervalDays,
  QuotaNotificationPlaceholder,
  QuotaNotificationValidationError,
} from '@zextras/ui-shared';
import {
  getQuotaNotificationCounter,
  QUOTA_NOTIFICATION_FIELD_MAX_LENGTH,
} from '@zextras/ui-shared';
import type { TFunction } from 'i18next';

export function getIntervalLabel(t: TFunction, days: number): string {
  if (days === 1) {
    return t('account_details.quota_notification.every_day', 'Every day');
  }
  return t('account_details.quota_notification.every_n_days', 'Every {{days}} days', { days });
}

export function getPlaceholderLabel(t: TFunction, placeholder: QuotaNotificationPlaceholder): string {
  const labels: Record<QuotaNotificationPlaceholder, string> = {
    usedQuota: t('account_details.quota_notification.placeholder.used_quota', 'Storage used'),
    quotaLimit: t('account_details.quota_notification.placeholder.quota_limit', 'Total storage'),
    displayName: t('account_details.quota_notification.placeholder.display_name', 'Display name'),
    email: t('account_details.quota_notification.placeholder.email', 'Email address'),
  };
  return labels[placeholder];
}

function getValidationMessage(
  t: TFunction,
  field: QuotaNotificationField,
  error: QuotaNotificationValidationError,
): string {
  const max = QUOTA_NOTIFICATION_FIELD_MAX_LENGTH[field];
  switch (error.code) {
    case 'REQUIRED':
      return field === 'subject'
        ? t('account_details.quota_notification.error.subject_required', 'Enter a subject.')
        : t('account_details.quota_notification.error.message_required', 'Enter a message.');
    case 'TOO_LONG':
      return t('account_details.quota_notification.error.too_long', 'The text is longer than {{max}} characters.', {
        max: max.toLocaleString('en-US'),
      });
    case 'FORBIDDEN_CHARACTER':
      return t(
        'account_details.quota_notification.error.forbidden_character',
        'The text contains a character that is not allowed ({{character}}).',
        { character: error.detail ?? '' },
      );
    default:
      return t(
        'account_details.quota_notification.error.unknown_placeholder',
        'Unknown value {{placeholder}}. Use the Insert value buttons.',
        { placeholder: error.detail ?? '' },
      );
  }
}

type FieldFeedback = {
  /** Error, limit or "no room" message shown under the field. */
  description: string | undefined;
  /** Character counter, visible from 90% of the limit. */
  counter: string | undefined;
};

export function getFieldFeedback(
  t: TFunction,
  field: QuotaNotificationField,
  value: string,
  error: QuotaNotificationValidationError | undefined,
  hasNoRoomMessage: boolean,
): FieldFeedback {
  const max = QUOTA_NOTIFICATION_FIELD_MAX_LENGTH[field];
  const counter = getQuotaNotificationCounter(value, max);
  const formattedMax = max.toLocaleString('en-US');

  let description: string | undefined;
  if (error) {
    description = getValidationMessage(t, field, error);
  } else if (hasNoRoomMessage) {
    description = t(
      'account_details.quota_notification.no_room',
      'There is no room for this value: the limit is {{max}} characters.',
      { max: formattedMax },
    );
  } else if (counter.isAtLimit) {
    description = t(
      'account_details.quota_notification.limit_reached',
      'You reached the {{max}}-character limit.',
      { max: formattedMax },
    );
  }

  return {
    description,
    counter: counter.isVisible
      ? `${counter.count.toLocaleString('en-US')} / ${formattedMax}`
      : undefined,
  };
}

export function isKnownInterval(days: number): days is QuotaNotificationIntervalDays {
  return days === 1 || days === 7 || days === 14 || days === 30;
}
