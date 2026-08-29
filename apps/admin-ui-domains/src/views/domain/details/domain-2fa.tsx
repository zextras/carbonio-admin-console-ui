/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FormPageLayout } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { TwoFactorAuthPolicyValues } from '../../../../types';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
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
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const {
    data: policies = [],
    error: policiesError,
    isPending,
  } = use2faPolicies(domainName);

  useQueryErrorSnackbar(policiesError);

  if (isPending || domainName === undefined) {
    return <ds-spinner></ds-spinner>;
  }

  return <DomainTwoFactorAuthForm policies={policies} domainName={domainName} />;
};
