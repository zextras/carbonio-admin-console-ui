/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { FormPageLayout, useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { TwoFactorAuthPolicyValues } from '../../../../types';
import { OK } from '../../../constants';
import { useSet2faPolicies } from '../../../services/use-set-2fa-policies';
import { TwoFactorPolicyArray } from '../../utility/utils';
import styles from './global-two-factor-auth.module.css';
import { TwoFactorPoliciesForm } from './two-factor-policies-form';
import { twoFactorPoliciesSchema } from './two-factor-policies-schema';
import { buildPoliciesFormValues, getChangedServices } from './two-factor-policies-utils';

export type GlobalTwoFactorAuthContentProps = {
  policies: Array<TwoFactorAuthPolicyValues>;
};

export const GlobalTwoFactorAuthContent = ({ policies }: GlobalTwoFactorAuthContentProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const setPolicyMutation = useSet2faPolicies('');
  const twoFactorPolicyArray = TwoFactorPolicyArray(t);

  const defaultValues = buildPoliciesFormValues(policies, twoFactorPolicyArray);

  const form = useForm({
    defaultValues,
    validators: { onChange: twoFactorPoliciesSchema, onSubmit: twoFactorPoliciesSchema },
    onSubmit: async ({ value }) => {
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

      form.reset(value, { keepDefaultValues: true });
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  return (
    <div className={styles.page}>
      <FormPageLayout
        title={t('label.2-factor-authentication', '2-Factor-Authentication')}
        unsavedChanges={isDirty}
        onCancel={() => form.reset()}
        onSave={() => form.handleSubmit()}
      >
        <TwoFactorPoliciesForm form={form} services={twoFactorPolicyArray} />
      </FormPageLayout>
    </div>
  );
};
