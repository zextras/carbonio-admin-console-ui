/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { differenceBy, remove } from 'lodash-es';

import type { SaveContext, SaveDeps } from './types';

/**
 * Applies the alias section of the account save: aliases present in the saved
 * value but missing from the current one are removed, new ones are added.
 * Fire-and-forget, matching the legacy flow (each alias reports its own
 * error; the generic ModifyAccount call is not gated on alias results).
 */
export function saveAliases(
  values: Record<string, any>,
  saved: Record<string, any>,
  modifiedKeys: Array<string>,
  deps: SaveDeps,
  ctx: SaveContext,
): void {
  if (!modifiedKeys.includes('mail')) {
    return;
  }
  differenceBy(`${saved.mail ?? ''}`.split(','), `${values.mail ?? ''}`.split(',')).forEach(
    (aliasName: string) => {
      void deps.deleteAlias
        .mutateAsync({ id: saved.zimbraId, alias: `${aliasName}` })
        .then(() => {
          void ctx.flushAccountCache();
        })
        .catch((error) => {
          ctx.notifySaveError(error);
        });
    },
  );
  differenceBy(`${values.mail ?? ''}`.split(','), `${saved.mail ?? ''}`.split(',')).forEach(
    (aliasName: string) => {
      void deps.addAlias
        .mutateAsync({ id: saved.zimbraId, alias: `${aliasName}` })
        .then(() => {
          void ctx.flushAccountCache();
        })
        .catch((error) => {
          ctx.notifySaveError(error);
        });
    },
  );
  remove(modifiedKeys, (ele) => ele === 'mail');
}
