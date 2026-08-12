/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { isEmpty } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import type { ModifyBackupData, ModifyBackupResponse } from '../../types';
import { backupQueryKeys } from './backup-query-keys';
import { modifyBackupRequest } from './modify-backup';

export function useModifyBackupConfig() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<ModifyBackupResponse, Error, ModifyBackupData>({
    mutationFn: async (modifiedData: ModifyBackupData) => {
      const data = await modifyBackupRequest(modifiedData);
      if (data?.status === 200 || isEmpty(data)) {
        return data;
      }
      const errorMessage =
        data?.errors?.[0]?.error ??
        data?.statusText ??
        (typeof data?.error === 'string' ? data?.error : '') ??
        t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
      throw new Error(errorMessage);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: backupQueryKeys.globalConfig() });
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t(
          'label.the_last_changes_has_been_saved_successfully',
          'Changes have been saved successfully',
        ),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    onError: (error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          error?.message ??
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
