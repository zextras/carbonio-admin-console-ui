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
import { useModifyDomain } from '../../../services/use-modify-domain';
import { type DomainAuthenticationFormValues, domainAuthenticationSchema } from './schema';
import { buildAuthDomainAttributes } from './utils';

type UseDomainAuthFormArgs = {
  defaultValues: DomainAuthenticationFormValues;
  zimbraId: string;
  isAdvanced: boolean;
};

export function useDomainAuthForm({
  defaultValues,
  zimbraId,
  isAdvanced,
}: UseDomainAuthFormArgs) {
  const saveInFlightRef = useRef(false);
  const queryClient = useQueryClient();
  const modifyDomainMutation = useModifyDomain(zimbraId);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: domainAuthenticationSchema,
      onSubmit: domainAuthenticationSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await modifyDomainMutation.mutateAsync({
          id: zimbraId,
          _jsns: ZIMBRA_ADMIN_URN,
          a: buildAuthDomainAttributes(value, isAdvanced),
        });

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

export type DomainAuthenticationFormApi = ReturnType<typeof useDomainAuthForm>['form'];
