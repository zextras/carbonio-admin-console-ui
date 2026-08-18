/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { legalHoldQueryKeys } from './legal-hold-query-keys';
import { setUnsetLegalHold } from './set-unset-legalhold';

type SetUnsetLegalHoldVariables = {
  status: string;
  id: string;
  serverName: string;
};

export function useSetUnsetLegalHold() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ status, id, serverName }: SetUnsetLegalHoldVariables) => {
      const result = await setUnsetLegalHold(status, id, serverName);
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalHoldQueryKeys.all });
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          error.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
