/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { remove } from 'lodash-es';

import type { SaveContext, SaveDeps } from './types';

export type PasswordChangeResult = 'skipped' | 'changed' | 'invalid';

/**
 * Applies the password section of the account save:
 * validates length and match, submits through `useSetPassword` and removes
 * the password keys from `modifiedKeys` so they are not sent again with the
 * generic ModifyAccount call.
 */
export async function savePassword(
  values: Record<string, any>,
  saved: Record<string, any>,
  modifiedKeys: Array<string>,
  deps: SaveDeps,
  ctx: SaveContext,
): Promise<PasswordChangeResult> {
  if (!values.password && !values.repeatPassword) {
    return 'skipped';
  }
  if (!modifiedKeys.includes('password') && !modifiedKeys.includes('repeatPassword')) {
    return 'skipped';
  }
  if (values.password?.length < 6) {
    ctx.errorSnackbar(
      ctx.t('label.password_length_msg', 'Password should be more than 5 character'),
    );
    return 'invalid';
  }
  if (values.password !== values.repeatPassword) {
    ctx.errorSnackbar(
      ctx.t('label.password_and_repeat_password_not_match', 'Passwords do not match'),
    );
    return 'invalid';
  }
  await deps.setPassword.mutateAsync({ id: saved.zimbraId, newPassword: values.password });
  void ctx.flushAccountCache();
  remove(modifiedKeys, (ele) => ele === 'password' || ele === 'repeatPassword');
  return 'changed';
}
