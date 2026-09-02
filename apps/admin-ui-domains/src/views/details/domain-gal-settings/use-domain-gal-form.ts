/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { domainByIdKey } from '@zextras/ui-shared';
import { useRef } from 'react';

import { ZIMBRA_ADMIN_URN } from '../../../constants';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import { useModifyAccount } from '../../../services/use-modify-account';
import { useModifyDataSource } from '../../../services/use-modify-data-source';
import { useModifyDomain } from '../../../services/use-modify-domain';
import {
  type DomainGalSettingsFormValues,
  domainGalSettingsSchema,
} from './schema';
import { buildGalDomainAttributes, formatPollingInterval } from './utils';

type UseDomainGalFormArgs = {
  defaultValues: DomainGalSettingsFormValues;
  zimbraId: string;
  galAccountIds: Array<string>;
  dataSourceIds: Array<{ accountId: string; dataSourceId: string }>;
};

export function useDomainGalForm({
  defaultValues,
  zimbraId,
  galAccountIds,
  dataSourceIds,
}: UseDomainGalFormArgs) {
  const saveInFlightRef = useRef(false);
  const queryClient = useQueryClient();
  const modifyDomainMutation = useModifyDomain(zimbraId);
  const modifyAccountMutation = useModifyAccount();
  const modifyDataSourceMutation = useModifyDataSource(zimbraId, undefined);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: domainGalSettingsSchema,
      onSubmit: domainGalSettingsSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await modifyDomainMutation.mutateAsync({
          id: zimbraId,
          _jsns: ZIMBRA_ADMIN_URN,
          a: buildGalDomainAttributes(value),
        });

        const pollingInterval = formatPollingInterval(value.freqDigits, value.freqUnit);

        if (galAccountIds.length > 0) {
          await Promise.all(
            galAccountIds.map((accountId) =>
              modifyAccountMutation.mutateAsync({
                id: accountId,
                modifiedData: {
                  zimbraDataSourceGalPollingInterval: pollingInterval,
                },
              }),
            ),
          );

          await Promise.all(
            dataSourceIds.map(({ accountId, dataSourceId }) =>
              modifyDataSourceMutation.mutateAsync({
                id: accountId,
                _jsns: ZIMBRA_ADMIN_URN,
                dataSource: {
                  id: dataSourceId,
                  a: [
                    { n: 'zimbraGalType', _content: value.zimbraGalMode },
                    { n: 'zimbraDataSourcePollingInterval', _content: pollingInterval },
                  ],
                },
              }),
            ),
          );
        }

        formApi.reset(value, { keepDefaultValues: true });
        if (zimbraId) {
          queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 1) });
          queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 0) });
          queryClient.invalidateQueries({ queryKey: domainQueryKeys.gal() });
        }
      } catch {
        // Mutation hooks already report errors via snackbar.
      }
    },
  });

  function handleSave(): void {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    void form.handleSubmit().finally(() => {
      saveInFlightRef.current = false;
    });
  }

  function handleCancel(): void {
    form.reset();
  }

  return { form, handleSave, handleCancel };
}

export type DomainGalSettingsFormApi = ReturnType<typeof useDomainGalForm>['form'];
