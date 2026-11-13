/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { createGalSyncAccount } from './create-gal-sync-service';
import { domainQueryKeys } from './domain-query-keys';
import { getDatasource } from './get-datasource-service';
import { reSyncGalAccount } from './re-sync-gal-account-service';

type AccountEntry = {
  by: string;
  _content: string;
};

type CreateGalSyncAccountVars = {
  name: string;
  domainName: string | undefined;
  server: string;
  account: Array<AccountEntry>;
  type: string;
  a?: Array<{ n: string; _content: string }>;
  folder?: string;
};

type CreateGalSyncAccountResponse = {
  account?: Array<{ id?: string; name?: string }>;
};

async function requestInitialGalSync(response: CreateGalSyncAccountResponse): Promise<void> {
  const accountId = response?.account?.[0]?.id;
  if (!accountId) throw new Error('Missing GAL account id');
  const dsResponse = await getDatasource(accountId);
  const dataSourceId: string | undefined = dsResponse?.dataSource?.[0]?.id;
  if (!dataSourceId) throw new Error('Missing GAL data source id');
  await reSyncGalAccount(accountId, dataSourceId);
}

export function useCreateGalSyncAccount(domainId: string | undefined) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: CreateGalSyncAccountVars) =>
      createGalSyncAccount(
        vars.name,
        vars.domainName,
        vars.server,
        vars.account,
        vars.type,
        vars.a,
        vars.folder
      ),
    onSuccess: (response: CreateGalSyncAccountResponse) => {
      requestInitialGalSync(response)
        .then(() => queryClient.invalidateQueries({ queryKey: domainQueryKeys.gal() }))
        .catch(() => {
          createSnackbar({
            key: 'warning',
            severity: 'warning',
            label: t(
              'label.gal_initial_sync_failed',
              'The GALSync account was created, but the first sync could not be started. Use RE-SYNC to start it.',
            ),
            autoHideTimeout: 5000,
            hideButton: true,
            replace: true,
          });
        });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.gal() });
      if (domainId) {
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 1) });
        queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 0) });
      }
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t(
          'label.create_galsync_account_success_msg',
          'You have created the GALSync account name',
        ),
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
