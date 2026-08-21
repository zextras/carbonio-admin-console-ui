/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { ExternalSoapResponse } from '../../types';
import { triggerBackupPurge } from './purge-backup';

export function usePurgeBackup() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation<ExternalSoapResponse, Error, string>({
    mutationFn: (server: string) => triggerBackupPurge(server),
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
