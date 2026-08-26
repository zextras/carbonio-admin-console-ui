/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { domainByIdKey } from '@zextras/ui-shared';
import { isEqual } from 'lodash-es';
import { useEffect, useRef } from 'react';

import { ZIMBRA_ADMIN_URN } from '../../../../constants';
import { useModifyDomain } from '../../../../services/use-modify-domain';
import type { themeConfigStore } from '../../../../../types/domain';
import {
  buildDomainResetValues,
  buildDomainWhiteLabelResetAttributes,
  pickThemeValues,
} from '../../../theme/white-label-defaults';
import { whiteLabelSchema } from '../../../theme/white-label-schema';

type UseDomainThemeFormArgs = {
  defaultValues: themeConfigStore;
  zimbraId: string;
  savedValues: themeConfigStore;
  domainInformation: Array<{ n: string; _content?: string }> | undefined;
};

export function useDomainThemeForm({
  defaultValues,
  zimbraId,
  savedValues,
  domainInformation,
}: UseDomainThemeFormArgs) {
  const saveInFlightRef = useRef(false);
  const savedValuesRef = useRef(savedValues);
  savedValuesRef.current = savedValues;

  const queryClient = useQueryClient();
  const modifyDomainMutation = useModifyDomain(zimbraId);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: whiteLabelSchema,
      onSubmit: whiteLabelSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const baseline = savedValuesRef.current as Record<string, unknown>;
      const modified = Object.entries(value).filter(
        ([key, val]) => !isEqual(val, baseline[key]),
      );
      if (modified.length === 0) {
        return;
      }

      try {
        await modifyDomainMutation.mutateAsync({
          id: zimbraId,
          _jsns: ZIMBRA_ADMIN_URN,
          a: modified.map(([n, _content]) => ({
            n,
            _content: (_content as string | undefined) ?? '',
          })),
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

  useEffect(() => {
    if (!domainInformation) {
      return;
    }
    if (form.state.isTouched || form.state.isDirty) {
      return;
    }
    form.reset(pickThemeValues(domainInformation), { keepDefaultValues: false });
  }, [domainInformation, form]);

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

  async function handleReset(): Promise<void> {
    try {
      await modifyDomainMutation.mutateAsync({
        id: zimbraId,
        _jsns: ZIMBRA_ADMIN_URN,
        a: buildDomainWhiteLabelResetAttributes(),
      });
      form.reset(buildDomainResetValues(), { keepDefaultValues: true });
      if (zimbraId) {
        queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 1) });
        queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 0) });
      }
    } catch {
      // Mutation hook already reports errors via snackbar.
    }
  }

  return {
    form,
    handleSave,
    handleCancel,
    handleReset,
    isPending: modifyDomainMutation.isPending,
  };
}

export type DomainThemeFormApi = ReturnType<typeof useDomainThemeForm>['form'];
