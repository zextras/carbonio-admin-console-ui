/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { cosQueryKeys } from './cos-query-keys';
import { deleteCOS } from './delete-cos-service';

export function useDeleteCos() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<Record<string, never>, Error, { cosId: string; cosName: string }>({
    mutationFn: ({ cosId }) => deleteCOS(cosId),
    onSuccess: async (_data, { cosName }) => {
      await queryClient.invalidateQueries({ queryKey: cosQueryKeys.all });
      createSnackbar({
        key: 'info',
        severity: 'info',
        label: t('label.delete_cos_succeess', {
          cosname: cosName,
          defaultValue: 'The {{cosname}} has been deleted successfully',
        }),
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
          error?.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
