/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FormPageLayout, useSnackbar } from '@zextras/ui-components';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { TwoFactorAuthPolicyValues } from '../../../../types';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { use2faPolicies } from '../../../services/use-2fa-policies';
import styles from '../../global/global-two-factor-auth/global-two-factor-auth.module.css';
import { TwoFactorPoliciesForm } from '../../global/global-two-factor-auth/two-factor-policies-form';
import { TwoFactorPolicyArray } from '../../utility/utils';
import { useDomain2faForm } from './domain-2fa/use-domain-2fa-form';

type DomainTwoFactorAuthFormProps = {
  policies: Array<TwoFactorAuthPolicyValues>;
  domainName: string;
};

const DomainTwoFactorAuthForm = ({ policies, domainName }: DomainTwoFactorAuthFormProps) => {
  const [t] = useTranslation();
  const twoFactorPolicyArray = TwoFactorPolicyArray(t);
  const { form, handleSave, handleCancel, isDirty } = useDomain2faForm({
    policies,
    domainName,
    services: twoFactorPolicyArray,
  });

  return (
    <div className={styles.page}>
      <FormPageLayout
        title={t('label.2-factor-authentication', '2-Factor-Authentication')}
        unsavedChanges={isDirty}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        <TwoFactorPoliciesForm form={form} services={twoFactorPolicyArray} />
      </FormPageLayout>
    </div>
  );
};

export const DomainTwoFactorAuthentication = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const {
    data: policies = [],
    error: policiesError,
    isPending,
  } = use2faPolicies(domainName);

  useEffect(() => {
    if (!policiesError) {
      return;
    }
    createSnackbar({
      key: 'error',
      severity: 'error',
      label:
        policiesError.message ??
        t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }, [policiesError, createSnackbar, t]);

  if (isPending || domainName === undefined) {
    return <ds-spinner></ds-spinner>;
  }

  return <DomainTwoFactorAuthForm policies={policies} domainName={domainName} />;
};
