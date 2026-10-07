/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { PlainSelect, Row, Switch } from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { DEFAULT } from '../../../constants';
import { isInheritedOverridden } from '../../utility/is-inherited-overridden';
import { RevertToInheritedIcon } from '../../utility/revert-to-inherited-icon';
import { AccountStatus, localeList } from '../../utility/utils';
import { useAccountForm, useSetAccountValues } from '../account-form-context';

export const SettingsFields = () => {
  const { form, cosDetail, accSpecificDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const localeZone = localeList(t);
  const ACCOUNT_STATUS: Array<{ value: string; label: string }> = AccountStatus(t);

  const cosItems = (cosData?.cos ?? []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
  const defaultCosId = cosItems.find((item: any) => item.label === DEFAULT)?.value;
  const isDefaultCos =
    values.defaultCOS ??
    (!values?.zimbraCOSId || values?.zimbraCOSId === defaultCosId);
  const displayCosId = isDefaultCos ? defaultCosId : values?.zimbraCOSId;
  const selection = cosItems.find((item: any) => item.value === displayCosId);

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
    const nextDefaultCos = !isDefaultCos;
    form.setFieldValue('defaultCOS', nextDefaultCos);
    if (nextDefaultCos) {
      form.setFieldValue('zimbraCOSId', defaultCosId);
    }
  };

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  const accountLocale = accSpecificDetail?.zimbraPrefLocale as string | undefined;
  const inheritedLocale = cosDetail?.zimbraPrefLocale as string | undefined;
  const liveLocale = values?.zimbraPrefLocale as string | undefined;
  const isLocaleOverridden = isInheritedOverridden(liveLocale, accountLocale, inheritedLocale);

  const effectiveLocale = liveLocale ?? inheritedLocale;
  const localeItems =
    effectiveLocale !== undefined &&
    !localeZone.some((item) => item.value === effectiveLocale)
      ? [...localeZone, { label: effectiveLocale, value: effectiveLocale }]
      : localeZone;

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
            <PlainSelect
              items={ACCOUNT_STATUS}
              label={t('label.account_status', 'Account Status')}
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
            <PlainSelect
              label={t('label.language', 'Language')}
              items={localeItems}
              selection={
                localeItems.find((item) => item.value === liveLocale) ??
                localeItems.find((item) => item.value === inheritedLocale) ??
                localeItems[0]
              }
              onChange={onPrefLocaleChange}
              description={
                isLocaleOverridden
                  ? undefined
                  : t(
                      'label.inherited_from_cos',
                      'Inherited from the Class of Service',
                    )
              }
              icon={
                isLocaleOverridden ? (
                  <RevertToInheritedIcon
                    label={t(
                      'label.click_to_revert',
                      'Click to revert to the inherited value',
                    )}
                    onClick={(): void => setEmptyValue('zimbraPrefLocale')}
                  />
                ) : undefined
              }
            />
          ) : (
            <></>
          )}
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="15.5%" mainAlignment="flex-start">
          <Switch
            onClick={onCOSSwitchChanges}
            label={t('account_details.default_COS', 'Default COS')}
            iconColor="primary"
            value={isDefaultCos}
          />
        </Row>
        <Row width="84.5%" mainAlignment="flex-start">
          {cosItems?.length ? (
            <PlainSelect
              disabled={isDefaultCos}
              items={cosItems}
              label={t('label.default_class_of_service', 'Default Class of Service')}
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
