/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import {
  buildRestoreDeletedAccountBody,
  doRestoreDeleteAccount,
  type RestoreAccountRequestParams,
} from './restore-delete-account-service';

const SNACKBAR_OPTIONS = {
  autoHideTimeout: 3000,
  hideButton: true,
  replace: true,
} as const;

type UseRestoreDeleteAccountOptions = {
  onRestored?: () => void;
};

export const useRestoreDeleteAccount = ({ onRestored }: UseRestoreDeleteAccountOptions = {}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  function showErrorSnackbar(label: string): void {
    createSnackbar({ key: 'error', severity: 'error', label, ...SNACKBAR_OPTIONS });
  }

  return useMutation({
    mutationFn: (params: RestoreAccountRequestParams) =>
      doRestoreDeleteAccount(buildRestoreDeletedAccountBody(params), params.serverName),
    onSuccess: (data) => {
      let error: string | undefined = data?.error?.details?.cause || data?.error?.message;
      if (error === undefined && data?.status !== 200) {
        error = t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
      }
      if (error) {
        showErrorSnackbar(error);
      }
      if (data?.operationId) {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t(
            'label.restore_account_has_added_operation_queue',
            'The restore of the account has been added to the operation queue successfully',
          ),
          ...SNACKBAR_OPTIONS,
        });
        onRestored?.();
      }
    },
    onError: (error: Error) => {
      showErrorSnackbar(
        error?.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      );
    },
  });
};
