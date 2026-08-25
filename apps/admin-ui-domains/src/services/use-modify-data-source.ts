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
import { modifyDataSource } from './modify-datasource-service';

type ModifyDataSourceBody = {
  id?: string;
  _jsns?: string;
  dataSource?: {
    id?: string;
    a?: Array<{ n: string; _content?: string }>;
  };
};

export function useModifyDataSource(
  domainId: string | undefined,
  accountId: string | undefined
) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ModifyDataSourceBody) => modifyDataSource(body),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.galDataSources(accountId) });
      }
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.gal() });
      if (domainId) {
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 1) });
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 0) });
      }
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
