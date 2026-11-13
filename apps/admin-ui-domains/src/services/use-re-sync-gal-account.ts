/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from './domain-query-keys';
import { reSyncGalAccount } from './re-sync-gal-account-service';

export type GalSyncTarget = {
  accountId: string;
  dataSourceId: string;
};

export function useReSyncGalAccount() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targets: Array<GalSyncTarget>) =>
      Promise.all(
        targets.map(({ accountId, dataSourceId }) => reSyncGalAccount(accountId, dataSourceId)),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.gal() });
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.gal_sync_requested', 'GAL sync requested'),
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
