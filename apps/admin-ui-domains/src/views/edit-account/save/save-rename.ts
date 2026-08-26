/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { remove } from 'lodash-es';

import { DOMAIN_NAME, UID } from '../../../constants';
import type { SaveContext, SaveDeps } from './types';

export async function saveRename(
  values: Record<string, any>,
  saved: Record<string, any>,
  modifiedKeys: Array<string>,
  deps: SaveDeps,
  ctx: SaveContext,
): Promise<void> {
  if (!modifiedKeys.includes(UID) && !modifiedKeys.includes(DOMAIN_NAME)) {
    return;
  }
  try {
    await deps.renameAccount.mutateAsync({
      id: saved.zimbraId,
      newName: `${values.uid}@${values.domainName}`,
    });
    ctx.successSnackbar(
      ctx.t('label.the_last_changes_has_been_saved_successfully', 'Changes have been saved successfully'),
    );
    await ctx.flushAccountCache();
  } catch (error) {
    ctx.notifySaveError(error as { message?: string });
  }
  ctx.onSaved();
  remove(modifiedKeys, (ele) => ele === UID);
  if (modifiedKeys.includes(DOMAIN_NAME)) {
    remove(modifiedKeys, (ele) => ele === DOMAIN_NAME);
    ctx.onDomainRenamed();
  }
}
