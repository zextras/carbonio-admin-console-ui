/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Input, LabeledValue, Row } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { map } from 'lodash-es';
import { ChangeEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ManageAliases } from '../../../components/manageAliases';
import { useAccountForm, useSetAccountValues } from '../account-form-context';
import { EditAccountQuotaBar } from '../parts/edit-account-quota-bar';
import { DomainRenameFields } from './domain-rename-fields';
import { getAccountUserType } from './utils';

type AccountInfoFieldsProps = {
  onNavigateToAdministration: () => void;
};

function createNavigateToAdministrationIcon(onNavigate: () => void): () => ReactElement {
  return function NavigateToAdministrationIcon() {
    return (
      <ds-icon
        icon="DiagonalArrowRightUp"
        onClick={onNavigate}
        style={{ cursor: 'pointer' }}
        size="large"
        onChange={(): null => null}
      ></ds-icon>
    );
  };
}

export const AccountInfoFields = ({ onNavigateToAdministration }: AccountInfoFieldsProps) => {
  const { form, otpList } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  const [accountAliases, setAccountAliases] = useState<Array<{ label: string }>>([]);
  const [prevMail, setPrevMail] = useState<string | undefined>(undefined);

  const changeAccDetail = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (values?.mail !== prevMail) {
    setPrevMail(values?.mail);
    setAccountAliases(
      values?.mail ? values.mail.split(', ').map((ele: string) => ({ label: ele })) : [],
    );
  }

  const accountUserType = getAccountUserType(
    values?.zimbraIsAdminAccount === 'TRUE',
    values?.zimbraIsDelegatedAdminAccount === 'TRUE',
    values?.zimbraIsExternalVirtualAccount === 'TRUE',
    values?.zimbraIsSystemAccount === 'TRUE',
  );

  return (
    <Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
        <ds-text as="h2" size="small" color="gray0" weight="bold">
          {t('label.account', 'Account')}
        </ds-text>
      </Row>
      <Row padding={{ vertical: 'large', left: 'large' }} width="100%" mainAlignment="flex-start">
        <EditAccountQuotaBar />
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="32%" mainAlignment="space-between">
          <Input
            isRequired
            data-testid="surname-input"
            label={t('label.surname', 'Surname')}
            backgroundColor="gray5"
            onChange={changeAccDetail}
            inputName="sn"
            value={values?.sn || ''}
          />
        </Row>
        <Row width="32%" mainAlignment="space-between">
          <Input
            data-testid="middlename-input"
            label={t('label.second_name_initials', 'Middle Name Initials')}
            backgroundColor="gray5"
            onChange={changeAccDetail}
            inputName="initials"
            value={values?.initials || ''}
          />
        </Row>
        <Row width="32%" mainAlignment="space-between">
          <Input
            data-testid="name-input"
            label={t('label.person_name', 'Name')}
            backgroundColor="gray5"
            onChange={changeAccDetail}
            inputName="givenName"
            value={values?.givenName || ''}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <DomainRenameFields />
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="49%" mainAlignment="flex-start">
          <ManageAliases
            viewType="small"
            aliasType="accounts"
            listAliases={accountAliases}
            setListAliases={setAccountAliases}
            setAliasChange={(aliaes): void =>
              setAccountValues((prev: Record<string, any>) => ({
                ...prev,
                mail: map(aliaes, 'label').join(', '),
              }))
            }
          />
        </Row>
        <Row width="49%" mainAlignment="flex-start">
          <LabeledValue
            label={t('label.type', 'Type')}
            value={accountUserType}
            CustomIcon={createNavigateToAdministrationIcon(onNavigateToAdministration)}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width={isAdvanced ? '49%' : '100%'} mainAlignment="flex-start">
          <Input
            label={t('label.advance_edit_display_name', 'Display Name')}
            backgroundColor="gray5"
            value={values?.displayName || ''}
            onChange={changeAccDetail}
            inputName="displayName"
            autoComplete="new-password"
          />
        </Row>
        {isAdvanced && (
          <Row width="49%" mainAlignment="flex-start">
            <LabeledValue
              label={t('account_details.otp_devices', 'OTP Devices')}
              backgroundColor="gray5"
              value={otpList?.length || 0}
              defaultValue={0}
            />
          </Row>
        )}
      </Row>
    </Row>
  );
};
