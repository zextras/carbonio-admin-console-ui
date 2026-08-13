/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { flushCache } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { cosQueryKeys } from './cos-query-keys';
import { renameCos, RenameCosBody } from './rename-cos-service';

export function useRenameCos(cosId?: string) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RenameCosBody>({
    mutationFn: (body: RenameCosBody) => renameCos(body),
    onSuccess: async (_data, body) => {
      await flushCache('cos', 'id', body.id._content);
      if (cosId) {
        queryClient.invalidateQueries({ queryKey: cosQueryKeys.detail(cosId) });
      }
      await queryClient.invalidateQueries({ queryKey: cosQueryKeys.all });
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
