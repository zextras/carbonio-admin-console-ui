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

export function useModifyAccountAttributes() {
  return useMutation({
    mutationFn: (vars: ModifyAccountAttributesVars) =>
      modifyAccountRequest(vars.id, vars.modifiedData),
  });
}
