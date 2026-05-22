/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CosResponse } from '../../types/cos';
import { cosQueryKeys } from './cos-query-keys';
import { flushCache } from './flush-cache-service';
import { modifyCos, ModifyCosBody } from './modify-cos-service';

export function useModifyCos(cosId?: string) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<CosResponse, Error, ModifyCosBody>({
    mutationFn: (body: ModifyCosBody) => modifyCos(body),
    onSuccess: (_data, body) => {
      flushCache('cos', 'id', body.id._content);
      if (cosId) {
        queryClient.invalidateQueries({ queryKey: cosQueryKeys.detail(cosId) });
      }
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
        label: error?.message
          ? error?.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
