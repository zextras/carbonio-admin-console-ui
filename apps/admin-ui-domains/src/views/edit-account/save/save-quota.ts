/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { remove } from 'lodash-es';

import { TOTAL_COMPUTED_QUOTA_LIMIT } from '../../../constants';
import type { SaveContext, SaveDeps } from './types';

export async function saveQuota(
  values: Record<string, any>,
  modifiedKeys: Array<string>,
  deps: SaveDeps,
  ctx: SaveContext,
): Promise<void> {
  if (!modifiedKeys.includes(TOTAL_COMPUTED_QUOTA_LIMIT) || !ctx.isAdvanced) {
    return;
  }
  try {
    await deps.setAccountQuota.mutateAsync({
      accountId: values.zimbraId,
      limit: values.totalComputedQuotaLimit,
    });
    remove(modifiedKeys, (key) => key === TOTAL_COMPUTED_QUOTA_LIMIT);
  } catch (error) {
    ctx.errorSnackbar(
      (error as { message?: string })?.message ??
        ctx.t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
    );
    throw error;
  }
}
