/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { reSyncGalAccount } from './re-sync-gal-account-service';

export function useReSyncGalAccount() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: (accountIds: Array<string>) =>
      Promise.all(accountIds.map((id) => reSyncGalAccount(id))),
    onSuccess: () => {
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.gal_successfully_re_synced', 'GAL successfully re-synced'),
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
