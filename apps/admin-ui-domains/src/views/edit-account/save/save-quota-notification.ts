/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { QuotaNotificationSaveResult } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';

import type { SaveContext, SaveDeps } from './types';

function getErrorLabel(t: TFunction, result: QuotaNotificationSaveResult): string {
  if (result.content === 'failed' && result.interval === 'failed') {
    return t(
      'account_details.quota_notification.save_error_both',
      'The quota notification message and frequency could not be saved. Please try again.',
    );
  }
  if (result.content === 'failed') {
    return t(
      'account_details.quota_notification.save_error_content',
      'The quota notification message could not be saved. Please try again.',
    );
  }
  return t(
    'account_details.quota_notification.save_error_interval',
    'The quota notification frequency could not be saved. Please try again.',
  );
}

/**
 * Content and frequency are separate calls. When one of them fails the failed part stays dirty,
 * an error snackbar says which one and the save stops here: the form must not report success.
 */
export async function saveQuotaNotification(deps: SaveDeps, ctx: SaveContext): Promise<void> {
  if (!deps.quotaNotification.isDirty) {
    return;
  }
  const result = await deps.quotaNotification.save();
  if (result.content === 'failed' || result.interval === 'failed') {
    if (result.focusField) {
      ctx.focusQuotaNotificationField(result.focusField);
    }
    ctx.errorSnackbar(getErrorLabel(ctx.t, result));
    throw new Error('Quota notification save failed');
  }
}
