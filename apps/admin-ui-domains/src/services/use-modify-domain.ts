/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey, flushCache } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from './domain-query-keys';
import { modifyDomain } from './modify-domain-service';

export type ModifyDomainBody = {
  id?: string;
  _jsns?: string;
  a?: Array<{ n: string; _content?: string }>;
};

export function useModifyDomain(domainId: string | undefined) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ModifyDomainBody) => modifyDomain(body),
    onSuccess: async () => {
      if (domainId) {
        await flushCache('domain', 'id', domainId);
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 1) });
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 0) });
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.quota(domainId) });
      }
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.change_save_success_msg', 'The change has been saved successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    onError: (error: Error) => {
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
