/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout, Padding } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { AuthLdapSection } from './sections/auth-ldap-section';
import { AuthMethodSection } from './sections/auth-method-section';
import { AuthResetPasswordSection } from './sections/auth-reset-password-section';
import { AuthVerifySection } from './sections/auth-verify-section';
import { useDomainAuthForm } from './use-domain-auth-form';
import { buildDomainAttrMap, getDefaultAuthFormValues } from './utils';

export const DomainAuthentication = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const isAdvanced = useIsAdvanced();
  const domainAttrMap = buildDomainAttrMap(domain?.a);
  const zimbraId = domainAttrMap.zimbraId ?? '';
  const defaultValues = getDefaultAuthFormValues(domainAttrMap);

  const { form, handleSave, handleCancel } = useDomainAuthForm({
    defaultValues,
    zimbraId,
    isAdvanced,
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  return (
    <Container
      height="calc(100vh - 105px)"
      background="gray6"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto' }}
    >
      <FormPageLayout
        title={t('label.authentication', 'Authentication')}
        unsavedChanges={isDirty}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        <Padding all="small" width="100%">
          <AuthMethodSection form={form} isAdvanced={isAdvanced} />
          <AuthLdapSection form={form} />
          <AuthVerifySection form={form} />
          {isAdvanced && <AuthResetPasswordSection form={form} />}
        </Padding>
      </FormPageLayout>
    </Container>
  );
};
