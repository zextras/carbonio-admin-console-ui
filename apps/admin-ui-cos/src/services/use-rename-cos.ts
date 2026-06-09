/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { renameCos, RenameCosBody } from './rename-cos-service';

export function useRenameCos() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation<void, Error, RenameCosBody>({
    mutationFn: (body: RenameCosBody) => renameCos(body),
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
