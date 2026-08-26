/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { InheritedSelect, Row, Select, Switch } from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT } from '../../../constants';
import { AccountStatus, localeList } from '../../utility/utils';
import {
  useAccountForm,
  useSetAccountValues,
} from '../account-form-context';

export const SettingsFields = () => {
  const { form, cosDetail, accSpecificDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const localeZone = localeList(t);
  const ACCOUNT_STATUS: Array<{ value: string; label: string }> = AccountStatus(t);
  const [defaultCOS, setDefaultCOS] = useState<boolean>(false);
  const [cosDefaultStateSet, setCosDefaultStateSet] = useState<boolean>(false);

  const cosItems = (cosData?.cos ?? []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
  const defaultCosId = cosItems.find((item: any) => item.label === DEFAULT)?.value;

  if (!cosDefaultStateSet && values?.zimbraCOSId && values.zimbraCOSId === defaultCosId) {
    setCosDefaultStateSet(true);
    setDefaultCOS(true);
  }

  const selection = cosItems.find((item: any) => item.value === values?.zimbraCOSId);

  const onAccountStatusChange = (v: any): any => {
    form.setFieldValue('zimbraAccountStatus', v);
  };
  const onPrefLocaleChange = (v: string): void => {
    if (v) form.setFieldValue('zimbraPrefLocale', v);
  };
  const onCOSIdChange = (v: any): void => {
    form.setFieldValue('zimbraCOSId', v);
  };
  const onCOSSwitchChanges = (): void => {
    if (defaultCOS) {
      form.setFieldValue('zimbraCOSId', cosItems[0]?.value);
    } else {
      form.setFieldValue('zimbraCOSId', defaultCosId);
    }
    setDefaultCOS(!defaultCOS);
  };

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  return (
    <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
      <Row padding={{ top: 'large' }}>
        <ds-text as="h2" size="small" color="gray0" weight="bold">
          {t('label.settings', 'Settings')}
        </ds-text>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="49%" mainAlignment="flex-start">
          {values?.zimbraId ? (
            <Select
              items={ACCOUNT_STATUS}
              background="gray5"
              label={t('label.account_status', 'Account Status')}
              showCheckbox={false}
              onChange={onAccountStatusChange}
              selection={
                ACCOUNT_STATUS.find(
                  (item: { value: string; label: string }) =>
                    item.value === values?.zimbraAccountStatus,
                ) ?? ACCOUNT_STATUS[0]
              }
            />
          ) : (
            <></>
          )}
        </Row>
        <Row width="49%" mainAlignment="flex-start">
          {values?.zimbraId && localeZone?.length ? (
            <InheritedSelect
              label={t('label.language', 'Language')}
              items={localeZone}
              subValue={values.zimbraPrefLocale}
              inheritedValue={cosDetail.zimbraPrefLocale}
              fromSubValue={accSpecificDetail?.zimbraPrefLocale}
              background="gray5"
              selectName="zimbraPrefLocale"
              onChange={onPrefLocaleChange}
              onChangeReset={(): void => setEmptyValue('zimbraPrefLocale')}
            />
          ) : (
            <></>
          )}
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="15.5%" mainAlignment="flex-start">
          <Switch
            defaultChecked={defaultCOS}
            onClick={onCOSSwitchChanges}
            label={t('account_details.default_COS', 'Default COS')}
            iconColor="primary"
            value={defaultCOS}
          />
        </Row>
        <Row width="84.5%" mainAlignment="flex-start">
          {cosItems?.length ? (
            <Select
              disabled={defaultCOS}
              items={cosItems}
              background="gray5"
              label={t('label.default_class_of_service', 'Default Class of Service')}
              showCheckbox={false}
              selection={selection ?? cosItems[0]}
              onChange={onCOSIdChange}
            />
          ) : (
            <></>
          )}
        </Row>
      </Row>
      <Row
        padding={{ top: 'large', left: 'large' }}
        width="100%"
        mainAlignment="space-between"
      ></Row>
    </Row>
  );
};
