/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useRef } from 'react';

import { ZIMBRA_ADMIN_URN } from '../../../constants';
import { useModifyDomain } from '../../../services/use-modify-domain';
import { buildDisclaimerDomainAttributes, type DomainDisclaimerFormValues } from './utils';

type UseDomainDisclaimerFormArgs = {
  defaultValues: DomainDisclaimerFormValues;
  domainId: string | undefined;
  domainName: string | undefined;
};

export function useDomainDisclaimerForm({
  defaultValues,
  domainId,
  domainName,
}: UseDomainDisclaimerFormArgs) {
  const saveInFlightRef = useRef(false);
  const modifyDomainMutation = useModifyDomain(domainId);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      try {
        await modifyDomainMutation.mutateAsync({
          id: domainId,
          _jsns: ZIMBRA_ADMIN_URN,
          a: buildDisclaimerDomainAttributes(value, domainName),
        });
        formApi.reset(value, { keepDefaultValues: true });
      } catch {
        // useModifyDomain already reports the failure via snackbar.
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

export type DomainDisclaimerFormApi = ReturnType<typeof useDomainDisclaimerForm>['form'];
