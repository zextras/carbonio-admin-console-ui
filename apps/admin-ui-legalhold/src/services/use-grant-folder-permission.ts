/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { DirectoryAccount } from '../../types';
import { grantFolderPermissions } from './grant-folder-permission';

type GrantFolderPermissionVariables = {
  accounts: Array<DirectoryAccount>;
  targetAccountId: string;
};

export function useGrantFolderPermission() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: async ({ accounts, targetAccountId }: GrantFolderPermissionVariables) => {
      const result = await grantFolderPermissions(accounts, targetAccountId);
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('legal_hold.permission_given_successfully', 'Permission given successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
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
