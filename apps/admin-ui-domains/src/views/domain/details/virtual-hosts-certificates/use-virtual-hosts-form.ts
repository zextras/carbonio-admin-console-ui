/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../../../../constants';
import { useModifyDomain } from '../../../../services/use-modify-domain';
import { virtualHostsFormSchema,type VirtualHostsFormValues } from './schema';
import { buildVirtualHostAttributes } from './utils';

type ModifyDomainWarning = { type?: string; message?: string };

type ModifyDomainResult = {
  warning?: Array<ModifyDomainWarning>;
};

type UseVirtualHostsFormArgs = {
  defaultValues: VirtualHostsFormValues;
  zimbraId: string;
};

export function useVirtualHostsForm({ defaultValues, zimbraId }: UseVirtualHostsFormArgs) {
  const saveInFlightRef = useRef(false);
  const queryClient = useQueryClient();
  const modifyDomainMutation = useModifyDomain(zimbraId);
  const createSnackbar = useSnackbar();
  const [t] = useTranslation();

  const form = useForm({
    defaultValues,
    validators: {
      onChange: virtualHostsFormSchema,
      onSubmit: virtualHostsFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = (await modifyDomainMutation.mutateAsync({
          id: zimbraId,
          _jsns: ZIMBRA_ADMIN_URN,
          a: buildVirtualHostAttributes(value.hosts),
        })) as ModifyDomainResult;

        if (Array.isArray(result?.warning) && result.warning.length > 0) {
          result.warning.forEach((warning) => {
            createSnackbar({
              key: `warning-${warning.type ?? 'virtual-host'}`,
              severity: 'warning',
              label:
                warning.message ??
                t('label.warning_message', 'A warning occurred during the operation'),
              autoHideTimeout: 5000,
              hideButton: true,
              replace: false,
            });
          });
        }

        formApi.reset(value, { keepDefaultValues: true });
        if (zimbraId) {
          queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 1) });
          queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 0) });
        }
      } catch {
        // Mutation hook already reports errors via snackbar.
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

export type VirtualHostsFormApi = ReturnType<typeof useVirtualHostsForm>['form'];
