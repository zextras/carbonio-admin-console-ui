/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { modifyAccountRequest } from './modify-account';

type ModifyAccountAttributesVars = {
  id: string;
  modifiedData: Record<string, any>;
};

/**
 * Generic account attribute modification for the edit-account save flow.
 * The hook is transport-only: cache invalidation and snackbars are owned by
 * the save handler that orchestrates it (`views/edit-account/save/`).
 */
export function useModifyAccountAttributes() {
  return useMutation({
    mutationFn: (vars: ModifyAccountAttributesVars) =>
      modifyAccountRequest(vars.id, vars.modifiedData),
  });
}
