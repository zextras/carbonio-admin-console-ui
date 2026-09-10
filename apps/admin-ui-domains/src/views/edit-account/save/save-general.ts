/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { remove } from 'lodash-es';

import {
  ABQ_MODE,
  ACCOUNT,
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
} from '../../../constants';
import type { SaveContext, SaveDeps } from './types';

export const VALUE_BLOCKED = 'VALUE-BLOCKED';

export type SaveRemainingResult = 'failed' | 'success' | 'password-success';

export function saveAdministrationRights(
  values: Record<string, any>,
  modifiedKeys: Array<string>,
  deps: SaveDeps,
  ctx: SaveContext,
): void {
  if (
    values.deleteAdministrationRights?.length > 0 &&
    modifiedKeys.includes('zimbraIsAdminAccount')
  ) {
    values.deleteAdministrationRights.forEach((item: { id: string }) => {
      void deps.removeDistributionListMember
        .mutateAsync({ listId: item.id, member: values.name })
        .catch((error) => {
          ctx.notifySaveError(error);
        });
    });
  }
}

export async function saveCoreAttributes(
  values: Record<string, any>,
  modifiedKeys: Array<string>,
  deps: SaveDeps,
  ctx: SaveContext,
): Promise<void> {
  const shouldApply =
    modifiedKeys.includes(ABQ_MODE) ||
    modifiedKeys.includes(BACKUP_ENABLED) ||
    modifiedKeys.includes(BACKUP_SELF_UNDELETE_ALLOWED);
  if (!shouldApply) {
    return;
  }
  const body: Record<string, { value: unknown; objectName: string; configType: string }> = {};
  if (modifiedKeys.includes(ABQ_MODE)) {
    body.abqMode = { value: values.abqMode, objectName: values.zimbraId, configType: ACCOUNT };
  }
  if (modifiedKeys.includes(BACKUP_ENABLED)) {
    body.backupEnabled = {
      value: values.backupEnabled,
      objectName: values.zimbraId,
      configType: ACCOUNT,
    };
  }
  if (modifiedKeys.includes(BACKUP_SELF_UNDELETE_ALLOWED)) {
    body.backupSelfUndeleteAllowed = {
      value: values.backupSelfUndeleteAllowed,
      objectName: values.zimbraId,
      configType: ACCOUNT,
    };
  }
  try {
    await deps.setCoreAttributes(body);
    remove(modifiedKeys, (ele) => ele === BACKUP_ENABLED);
    remove(modifiedKeys, (ele) => ele === ABQ_MODE);
    remove(modifiedKeys, (ele) => ele === BACKUP_SELF_UNDELETE_ALLOWED);
  } catch (error) {
    ctx.notifySaveError(error as { message?: string });
    throw error;
  }
}

export async function saveRemainingAttributes(
  values: Record<string, any>,
  saved: Record<string, any>,
  modifiedKeys: Array<string>,
  isPasswordChange: boolean,
  deps: SaveDeps,
  ctx: SaveContext,
  finalize: () => void,
): Promise<SaveRemainingResult> {
  const modifiedData: Record<string, any> = {};
  modifiedKeys.forEach((ele) => {
    modifiedData[ele] = values[ele];
  });

  if (values.defaultCOS && modifiedKeys.includes('zimbraCOSId')) {
    modifiedData.zimbraCOSId = '';
  }

  if (modifiedKeys.length === 0) {
    if (isPasswordChange) {
      ctx.successSnackbar(ctx.t('account_details.user_password_set', 'User password set successfully'));
      values.userPassword = VALUE_BLOCKED;
      values.zimbraPasswordMustChange = 'FALSE';
      finalize();
      return 'password-success';
    }
    finalize();
    return 'success';
  }

  try {
    const data = await deps.modifyAccountAttributes.mutateAsync({
      id: saved.zimbraId,
      modifiedData,
    });
    if (data == null) {
      ctx.notifySaveError();
      return 'failed';
    }
    await ctx.flushAccountCache();
    finalize();
    return 'success';
  } catch (error) {
    ctx.notifySaveError(error as { message?: string });
    return 'failed';
  }
}
