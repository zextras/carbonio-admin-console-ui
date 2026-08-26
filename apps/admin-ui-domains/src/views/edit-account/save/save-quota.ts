/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { remove } from 'lodash-es';

import { TOTAL_COMPUTED_QUOTA_LIMIT } from '../../../constants';
import type { SaveContext, SaveDeps } from './types';

/**
 * Applies the quota section of the account save (advanced builds only):
 * a `limited` value sets the account quota, an `unlimited`/cleared value
 * unsets it so the account inherits the COS/domain limit. The hook owns the
 * accountQuota/accountDetail invalidation; this handler owns the snackbars.
 */
export function saveQuota(
  values: Record<string, any>,
  modifiedKeys: Array<string>,
  deps: SaveDeps,
  ctx: SaveContext,
): void {
  if (!modifiedKeys.includes(TOTAL_COMPUTED_QUOTA_LIMIT) || !ctx.isAdvanced) {
    return;
  }
  void deps.setAccountQuota
    .mutateAsync({ accountId: values.zimbraId, limit: values.totalComputedQuotaLimit })
    .then(() => {
      ctx.successSnackbar(
        ctx.t(
          'label.the_last_changes_has_been_saved_successfully',
          'Changes have been saved successfully',
        ),
      );
    })
    .catch((error: { message?: string }) => {
      ctx.errorSnackbar(
        error?.message ??
          ctx.t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      );
    });
  remove(modifiedKeys, (key) => key === TOTAL_COMPUTED_QUOTA_LIMIT);
}
