/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { batchService } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../constants';
import { mtaQueryKeys } from './mta-query-keys';

type BatchMailQueueActionInput = {
  serverName: string;
  MailQueueActionRequest: unknown;
};

export function useBatchMailQueueAction() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<Record<string, unknown>, Error, BatchMailQueueActionInput>({
    mutationFn: ({ MailQueueActionRequest }) =>
      batchService({
        MailQueueActionRequest,
        _jsns: ZIMBRA_ADMIN_URN,
      }),
    onSuccess: async (_data, { serverName }) => {
      await queryClient.invalidateQueries({ queryKey: [...mtaQueryKeys.all, 'mail-queue'] });
      await queryClient.invalidateQueries({ queryKey: mtaQueryKeys.mailQueueInfo(serverName) });
    },
    onError: (error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: error?.message
          ? error.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
