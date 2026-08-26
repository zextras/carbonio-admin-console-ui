/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import {
  Input,
  LabeledValue,
  PasswordInput,
  Switch,
} from '@zextras/ui-components';
import { find } from 'lodash-es';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../../../hooks/use-selected-domain';
import {
  computeAutoFillDisplayName,
  computeAutoFillUserName,
} from '../auto-fill-utils';
import { useCreateAccountFormContext } from '../create-account-form-context';
import { CREATE_ACCOUNT_VALIDATION_MESSAGES } from '../create-account-schema';
import { getCreateAccountFieldErrorProps } from '../field-error';

export const AccountInfoFields = (): ReactElement => {
  const [t] = useTranslation();
  const { form, submitAttempted } = useCreateAccountFormContext();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;

  const snField = useField({ form, name: 'sn' });
  const initialsField = useField({ form, name: 'initials' });
  const givenNameField = useField({ form, name: 'givenName' });
  const nameField = useField({ form, name: 'name' });
  const displayNameField = useField({ form, name: 'displayName' });
  const passwordField = useField({ form, name: 'password' });
  const repeatPasswordField = useField({ form, name: 'repeatPassword' });
  const mustChangeField = useField({ form, name: 'zimbraPasswordMustChange' });

  const snError = getCreateAccountFieldErrorProps(
    snField,
    t,
    CREATE_ACCOUNT_VALIDATION_MESSAGES,
    submitAttempted,
  );
  const passwordError = getCreateAccountFieldErrorProps(
    passwordField,
    t,
    CREATE_ACCOUNT_VALIDATION_MESSAGES,
    submitAttempted,
  );
  const repeatPasswordError = getCreateAccountFieldErrorProps(
    repeatPasswordField,
    t,
    CREATE_ACCOUNT_VALIDATION_MESSAGES,
    submitAttempted,
  );

  const autoFillName = computeAutoFillUserName(form.state.values);
  const autoFillDisplayName = computeAutoFillDisplayName(form.state.values);
  const showAutoFillAlert =
    !form.state.values.changeNameBool &&
    autoFillName === null &&
    (!!autoFillDisplayName || !!form.state.values.displayName);

  const domainStatusClosed = find(domain?.a, { n: 'zimbraDomainStatus' })?._content === 'closed';
  const closedStatusLabel = domainStatusClosed ? `(${t('label.closed', 'Closed')})` : '';

  return (
    <div className="flex w-full flex-wrap justify-start pl-sm">
      <ds-text size="small" color="gray0" weight="bold" as="h2">
        {t('label.account', 'Account')}
      </ds-text>
      <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
        <div className="flex w-[32%] flex-wrap justify-between">
          <Input
            label={t('label.surname', 'Surname')}
            backgroundColor="gray5"
            value={snField.state.value}
            hasError={snError.hasError}
            description={snError.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              snField.handleChange(e.target.value);
            }}
            inputName="sn"
          />
        </div>
        <div className="flex w-[32%] flex-wrap justify-between">
          <Input
            label={t('label.second_name_initials', 'Middle Name Initials')}
            backgroundColor="gray5"
            value={initialsField.state.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              initialsField.handleChange(e.target.value);
            }}
            inputName="initials"
          />
        </div>
        <div className="flex w-[32%] flex-wrap justify-between">
          <Input
            value={givenNameField.state.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              givenNameField.handleChange(e.target.value);
            }}
            inputName="givenName"
            label={t('label.person_name', 'Name')}
            backgroundColor="gray5"
          />
        </div>
      </div>
      <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
        <div className="flex w-[48%] flex-wrap justify-start">
          <Input
            backgroundColor="gray5"
            label={t('label.user_auto_fill', 'user (Auto-fill)')}
            value={form.state.values.changeNameBool ? form.state.values.name : (autoFillName ?? '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              form.setFieldValue('changeNameBool', true);
              nameField.handleChange(e.target.value?.replaceAll(' ', '')?.toLowerCase() ?? '');
            }}
            inputName="name"
          />
          {showAutoFillAlert && (
            <ds-text color="error" size="small" as="strong">
              {t('accountDetails.auto_fill_user_is_disabled', 'Auto fill user is disabled')}
            </ds-text>
          )}
        </div>
        <div className="flex w-[48%] flex-wrap justify-start">
          <div className="flex w-[10%] flex-wrap items-start justify-center pt-sm">
            <ds-icon icon="AtOutline" size="large"></ds-icon>
          </div>
          <div className="flex w-[90%] flex-wrap items-start justify-start">
            <LabeledValue
              label={t('label.domain_name', 'Domain Name')}
              backgroundColor="gray6"
              value={`${domainName} ${closedStatusLabel}`}
            />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-wrap pt-lg pl-lg">
        <Input
          label={t('label.display_name_auto_fill', 'Display Name (Auto-fill)')}
          backgroundColor="gray5"
          value={
            form.state.values.changeDisplayNameBool
              ? form.state.values.displayName
              : autoFillDisplayName
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            form.setFieldValue('changeDisplayNameBool', true);
            displayNameField.handleChange(e.target.value);
          }}
          inputName="displayName"
          autoComplete="new-password"
        />
      </div>
      <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
        <div className="flex w-[48%] flex-wrap justify-start">
          <PasswordInput
            isRequired
            backgroundColor="gray5"
            label={t('label.password', 'Password')}
            value={passwordField.state.value}
            hasError={passwordError.hasError}
            description={passwordError.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              passwordField.handleChange(e.target.value);
            }}
            inputName="password"
            autoComplete="new-password"
          />
        </div>
        <div className="flex w-[48%] flex-wrap justify-start">
          <PasswordInput
            isRequired
            backgroundColor="gray5"
            label={t('label.repeat_password', 'Repeat Password')}
            value={repeatPasswordField.state.value}
            hasError={repeatPasswordError.hasError}
            description={repeatPasswordError.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              repeatPasswordField.handleChange(e.target.value);
            }}
            inputName="repeatPassword"
            autoComplete="new-password"
          />
        </div>
      </div>
      <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
        <div className="flex w-full flex-wrap justify-start">
          <Switch
            value={mustChangeField.state.value}
            onClick={(): void => {
              mustChangeField.handleChange(!mustChangeField.state.value);
            }}
            label={t(
              'accountDetails.user_will_change_password_on_next_login',
              'User will change password on next login',
            )}
            iconColor="primary"
          />
        </div>
      </div>
    </div>
  );
};
