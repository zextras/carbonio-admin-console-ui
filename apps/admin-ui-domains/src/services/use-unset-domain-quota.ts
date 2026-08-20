/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from './domain-query-keys';
import { unsetDomainQuota } from './unset-domain-quota';

export function useUnsetDomainQuota(domainId: string | undefined) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!domainId) throw new Error('Missing domainId');
      const result = await unsetDomainQuota(domainId);
      if (result.type === 'error') throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      if (domainId) {
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.quota(domainId) });
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 1) });
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 0) });
      }
    },
    onError: () => {
      createSnackbar({
        key: 'quota-error',
        severity: 'error',
        label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
