/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { useSnackbar } from '@zextras/ui-components';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { TwoFactorAuthPolicyValues, TwoFactorPolicy } from '../../../../../types';
import { OK } from '../../../../constants';
import { useSet2faPolicies } from '../../../../services/use-set-2fa-policies';
import { twoFactorPoliciesSchema } from '../../../global/global-two-factor-auth/two-factor-policies-schema';
import {
  buildPoliciesFormValues,
  getChangedServices,
} from '../../../global/global-two-factor-auth/two-factor-policies-utils';

type UseDomain2faFormArgs = {
  policies: Array<TwoFactorAuthPolicyValues>;
  domainName: string;
  services: Array<TwoFactorPolicy>;
};

export function useDomain2faForm({ policies, domainName, services }: UseDomain2faFormArgs) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const saveInFlightRef = useRef(false);
  const setPolicyMutation = useSet2faPolicies(domainName);
  const defaultValues = buildPoliciesFormValues(policies, services);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: twoFactorPoliciesSchema,
      onSubmit: twoFactorPoliciesSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const results = await Promise.allSettled(
        getChangedServices(value, defaultValues).map((service) =>
          setPolicyMutation.mutateAsync({
            service,
            trustedDevice: value[service]?.trustedDevice,
            trustedIpRange:
              (value[service]?.trustedIpRange?.length ?? 0) > 0
                ? value[service]?.trustedIpRange?.join(',')
                : 'empty',
          }),
        ),
      );

      const failures = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      if (failures.length > 0) {
        const failureReason = failures[0]?.reason;
        createSnackbar({
          key: 'policy-error',
          severity: 'error',
          label:
            failureReason instanceof Error
              ? failureReason.message
              : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        return;
      }

      const warningMessages = results
        .map((result) => (result.status === 'fulfilled' ? result.value.message : undefined))
        .filter((message): message is string => Boolean(message) && message !== OK);
      createSnackbar({
        key: 'policy-success',
        severity: warningMessages.length > 0 ? 'warning' : 'success',
        label:
          warningMessages[0] ??
          t(
            'label.2fa-policy-updated-successfully',
            'The settings have been applied to all services',
          ),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });

      formApi.reset(value, { keepDefaultValues: true });
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

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

  return { form, handleSave, handleCancel, isDirty };
}
