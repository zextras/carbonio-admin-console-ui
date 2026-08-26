/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Input } from '@zextras/ui-components';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { Attribute } from '../../../../../types';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { useCreateAccountFormContext } from './create-account-form-context';
import { AccountInfoFields } from './sections/account-info-fields';
import { ContactCompanyFields } from './sections/contact-company-fields';
import { DescriptionNotesFields } from './sections/description-notes-fields';
import { SettingsFields } from './sections/settings-fields';

function hasExternalLdapUrl(attrs: Array<Attribute> | undefined): boolean {
  const ldapUrl = attrs?.find((item) => item?.n === 'zimbraAuthLdapURL');
  return ldapUrl?._content !== undefined && ldapUrl?._content !== '';
}

export const ExternalLdapField = (): ReactElement => {
  const [t] = useTranslation();
  const { form } = useCreateAccountFormContext();
  const ldapDn = form.state.values.zimbraAuthLdapExternalDn;

  return (
    <div className="flex w-full flex-wrap justify-start pt-lg pl-sm">
      <div className="flex w-full flex-wrap justify-between pt-lg">
        <ds-text size="small" color="gray0" weight="bold" as="h2">
          {t('domain.accounts.editAccount.externalldap', 'External LDAP')}
        </ds-text>
      </div>
      <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
        <div className="flex w-full flex-wrap justify-between">
          <Input
            data-testid="zimbraAuthLdapExternalDn"
            label={t(
              'domain.accounts.editAccount.externalldapReferenceForAuthentication',
              'External LDAP Reference for Authentication',
            )}
            backgroundColor="gray5"
            value={ldapDn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              form.setFieldValue('zimbraAuthLdapExternalDn', e.target.value);
            }}
            inputName="zimbraAuthLdapExternalDn"
          />
        </div>
      </div>
    </div>
  );
};

/** Details step of the create-account wizard: composition of the field sections. */
const CreateAccountDetailSection = (): ReactElement => {
  const { data: domain } = useSelectedDomain();
  const extLdapAuth = hasExternalLdapUrl(domain?.a);

  return (
    <div className="flex max-h-full w-full flex-col flex-nowrap items-center justify-start overflow-auto pl-lg pr-xl pb-lg transition-[left] duration-200 ease-in-out">
      <AccountInfoFields />
      <div className="w-full pt-md">
        <ds-divider></ds-divider>
      </div>
      {extLdapAuth && <ExternalLdapField />}
      <SettingsFields />
      <DescriptionNotesFields />
      <ContactCompanyFields />
    </div>
  );
};

export default CreateAccountDetailSection;
