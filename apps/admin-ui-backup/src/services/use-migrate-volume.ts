/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { ExternalSoapResponse } from '../../types';
import { backupQueryKeys } from './backup-query-keys';
import { migrateVolume } from './migrate-volume';

export function useMigrateVolume(serverId?: string) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<ExternalSoapResponse, Error, Record<string, unknown>>({
    mutationFn: (body: Record<string, unknown>) => migrateVolume(body),
    onSuccess: async () => {
      if (serverId) {
        await queryClient.invalidateQueries({ queryKey: backupQueryKeys.serverConfig(serverId) });
      }
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
