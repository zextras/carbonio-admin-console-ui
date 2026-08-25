/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from './domain-query-keys';
import { modifyAccountRequest } from './modify-account';

type ModifyAccountVars = {
  id: string;
  modifiedData: Record<string, string>;
};

export function useModifyAccount() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: ModifyAccountVars) => modifyAccountRequest(vars.id, vars.modifiedData),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.galAccount(vars.id) });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.gal() });
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: error?.message
          ? error.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
