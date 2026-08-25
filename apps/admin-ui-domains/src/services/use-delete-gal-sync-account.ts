/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { destroyAccount } from './destroy-account-service';
import { domainQueryKeys } from './domain-query-keys';

export function useDeleteGalSyncAccount(domainId: string | undefined) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => destroyAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.gal() });
      if (domainId) {
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 1) });
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 0) });
      }
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.changes_save_success_msg', 'Your changes has been saved!'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
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
