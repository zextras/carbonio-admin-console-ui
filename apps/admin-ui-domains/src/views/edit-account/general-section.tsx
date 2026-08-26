/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  ChipInput,
  Container,
  CustomTextArea,
  Input,
  Row,
} from '@zextras/ui-components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../hooks/use-selected-domain';
import CustomChip from '../components/customChip';
import { useAccountForm, useSetAccountValues } from './account-form-context';
import { AccountInfoFields } from './general-section/account-info-fields';
import { AccountStatusFlags } from './general-section/account-status-flags';
import { PasswordFields } from './general-section/password-fields';
import { QuotaDisplay } from './general-section/quota-display';
import { SessionsTable } from './general-section/sessions-table';
import { SettingsFields } from './general-section/settings-fields';
import { hasExternalLdapUrl, isLdapAuthWithoutFallback } from './general-section/utils';

type EditAccountGeneralSectionProps = {
  onNavigateToAdministration: () => void;
};

export const EditAccountGeneralSection = ({
  onNavigateToAdministration,
}: EditAccountGeneralSectionProps) => {
  const { form, directMemberList, inDirectMemberList, allowedDeletePassword } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const { data: domain } = useSelectedDomain();
  const domainInformation = domain?.a;
  const [t] = useTranslation();

  const isHidePassword = isLdapAuthWithoutFallback(domainInformation);
  const extLdapAuth = hasExternalLdapUrl(domainInformation);

  const changeAccDetail = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
    >
      <AccountInfoFields onNavigateToAdministration={onNavigateToAdministration} />
      <QuotaDisplay />
      <AccountStatusFlags />
      <PasswordFields
        isHidePassword={isHidePassword}
        allowedDeletePassword={allowedDeletePassword}
      />

      {extLdapAuth && (
        <>
          <Row width="100%">
            <ds-divider></ds-divider>
          </Row>
          <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
            <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
              <ds-text as="h2" size="small" color="gray0" weight="bold">
                {t('domain.accounts.editAccount.externalldap', 'External LDAP')}
              </ds-text>
            </Row>
            <Row
              padding={{ top: 'large', left: 'large' }}
              width="100%"
              mainAlignment="space-between"
            >
              <Row width="100%" mainAlignment="space-between">
                <Input
                  data-testid="zimbraAuthLdapExternalDn"
                  label={t(
                    'domain.accounts.editAccount.externalldapReferenceForAuthentication',
                    'External LDAP Reference for Authentication',
                  )}
                  backgroundColor="gray5"
                  onChange={changeAccDetail}
                  inputName="zimbraAuthLdapExternalDn"
                  value={values?.zimbraAuthLdapExternalDn || ''}
                />
              </Row>
            </Row>
          </Row>
        </>
      )}
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <SettingsFields />
      <Row width="100%" padding={{ top: 'large' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
        <ds-text as="h2" size="small" color="gray0" weight="bold">
          {t('label.distribution_list', 'Distribution List')}
        </ds-text>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="space-between">
          <ChipInput
            placeholder={t(
              'account_details.this_account_is_a_direct_member_of',
              'This account is a direct member of',
            )}
            background="gray4"
            disabled
            value={directMemberList}
            ChipComponent={CustomChip}
            maxChips={null}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="space-between">
          <ChipInput
            placeholder={t(
              'account_details.this_account_is_a_in_direct_member_of',
              'This account is an indirect member of',
            )}
            background="gray4"
            disabled
            value={inDirectMemberList}
            ChipComponent={CustomChip}
            maxChips={null}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }}>
          <ds-text as="h2" size="small" color="gray0" weight="bold">
            {t('label.description', 'Description')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%">
          <Input
            backgroundColor="gray5"
            label={t('label.description', 'Description')}
            value={values?.description || ''}
            onChange={changeAccDetail}
            inputName="description"
          />
        </Row>
        <Row padding={{ top: 'large' }}>
          <ds-text as="h2" size="small" color="gray0" weight="bold">
            {t('label.notes', 'Notes')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%">
          <CustomTextArea
            label={t('label.notes', 'Notes')}
            value={values?.zimbraNotes || ''}
            backgroundColor="gray5"
            inputName="zimbraNotes"
            onChange={changeAccDetail}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <SessionsTable />
    </Container>
  );
};
