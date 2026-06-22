/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { setCoreAttributes } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

export function useSetCoreAttributes() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation<void, Error, Record<string, unknown>>({
    mutationFn: (body) => setCoreAttributes(body),
    onError: () => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
