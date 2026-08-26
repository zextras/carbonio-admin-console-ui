/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  InheritedInput,
  InheritedSelect,
  InheritedSwitch,
  ListRow,
  Row,
} from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';

/** Failed login policy block: lockout switch, max failures, lockout duration and failure window. */
export const FailedLoginPolicy = () => {
  const { form, accSpecificDetail, cosDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const [t] = useTranslation();

  const [zimbraPasswordLockoutDurationNum, setZimbraPasswordLockoutDurationNum] = useState(
    values?.zimbraPasswordLockoutDuration?.slice(0, -1),
  );
  const zimbraPasswordLockoutDurationType =
    values?.zimbraPasswordLockoutDuration?.slice(-1) || '';
  const [zimbraPasswordLockoutFailureLifetimeNum, setZimbraPasswordLockoutFailureLifetimeNum] =
    useState(values?.zimbraPasswordLockoutFailureLifetime?.slice(0, -1));
  const zimbraPasswordLockoutFailureLifetimeType =
    values?.zimbraPasswordLockoutFailureLifetime?.slice(-1) || '';

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  const onZimbraPasswordLockoutDurationTypeChange = (v: string) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPasswordLockoutDuration: zimbraPasswordLockoutDurationNum
        ? `${zimbraPasswordLockoutDurationNum}${v}`
        : '',
    }));
  };
  const onZimbraPasswordLockoutDurationNumChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPasswordLockoutDuration: e.target.value
        ? `${e.target.value}${zimbraPasswordLockoutDurationType}`
        : '',
    }));
    setZimbraPasswordLockoutDurationNum(e.target.value);
  };

  const onZimbraPasswordLockoutFailureLifetimeTypeChange = (v: string) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPasswordLockoutFailureLifetime: zimbraPasswordLockoutFailureLifetimeNum
        ? `${zimbraPasswordLockoutFailureLifetimeNum}${v}`
        : '',
    }));
  };
  const onZimbraPasswordLockoutFailureLifetimeNumChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPasswordLockoutFailureLifetime: e.target.value
        ? `${e.target.value}${zimbraPasswordLockoutFailureLifetimeType}`
        : '',
    }));
    setZimbraPasswordLockoutFailureLifetimeNum(e.target.value);
  };

  const timeItems: any[] = [
    {
      label: t('label.days', 'Days'),
      value: 'd',
    },
    {
      label: t('label.hours', 'Hours'),
      value: 'h',
    },
    {
      label: t('label.minutes', 'Minutes'),
      value: 'm',
    },
    {
      label: t('label.seconds', 'Seconds'),
      value: 's',
    },
  ];

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="h2" weight="bold">
        {t('cos.failed_login_policy', 'Failed Login Policy')}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start">
              <InheritedSwitch
                subValue={values?.zimbraPasswordLockoutEnabled}
                onChange={toggleAccountValue}
                label={t('cos.enable_failed_login_lockout', 'Enable failed login lockout')}
                iconColor="primary"
                inheritedValue={cosDetail.zimbraPasswordLockoutEnabled}
                fromSubValue={accSpecificDetail?.zimbraPasswordLockoutEnabled}
                inputName={'zimbraPasswordLockoutEnabled'}
                onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutEnabled')}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start">
              <InheritedInput
                isRequired
                label={t(
                  'cos.number_of_consecutive_failed_login_allowed',
                  'Number of consecutive failed logins allowed',
                )}
                subValue={values.zimbraPasswordLockoutMaxFailures}
                inheritedValue={cosDetail.zimbraPasswordLockoutMaxFailures}
                fromSubValue={accSpecificDetail?.zimbraPasswordLockoutMaxFailures}
                background="gray5"
                inputName="zimbraPasswordLockoutMaxFailures"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAccountValues((prev: Record<string, any>) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }));
                }}
                onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutMaxFailures')}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container width="75%" padding={{ right: 'small' }}>
              <InheritedInput
                isRequired
                label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
                subValue={values.zimbraPasswordLockoutDuration?.slice(0, -1)}
                inheritedValue={cosDetail.zimbraPasswordLockoutDuration?.slice(0, -1)}
                fromSubValue={accSpecificDetail?.zimbraPasswordLockoutDuration}
                background="gray5"
                inputName="zimbraPasswordLockoutDuration"
                onChange={onZimbraPasswordLockoutDurationNumChange}
                onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
              />
            </Container>
            <Container width="25%" padding={{ left: 'small' }}>
              <InheritedSelect
                label={t('cos.time_range', 'Time Range')}
                items={timeItems}
                subValue={values?.zimbraPasswordLockoutDuration?.slice(-1) || ''}
                inheritedValue={cosDetail.zimbraPasswordLockoutDuration?.slice(-1) || ''}
                fromSubValue={accSpecificDetail?.zimbraPasswordLockoutDuration}
                background="gray5"
                selectName="zimbraPasswordLockoutDuration"
                onChange={onZimbraPasswordLockoutDurationTypeChange}
                onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large', bottom: 'large' }}
        >
          <ListRow>
            <Container width="75%" padding={{ right: 'small' }}>
              <InheritedInput
                isRequired
                label={t(
                  'cos.time_window_failed_logins_must_occur_to_lock_account',
                  'Time window in which the failed logins must occur to lock the account:',
                )}
                subValue={values.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)}
                inheritedValue={cosDetail.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)}
                fromSubValue={accSpecificDetail?.zimbraPasswordLockoutFailureLifetime}
                background="gray5"
                inputName="zimbraPasswordLockoutFailureLifetime"
                onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
                onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutFailureLifetime')}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
              />
            </Container>
            <Container width="25%" padding={{ left: 'small' }}>
              <InheritedSelect
                label={t('cos.time_range', 'Time Range')}
                items={timeItems}
                subValue={values?.zimbraPasswordLockoutFailureLifetime?.slice(-1) || ''}
                inheritedValue={
                  cosDetail.zimbraPasswordLockoutFailureLifetime?.slice(-1) || ''
                }
                fromSubValue={accSpecificDetail?.zimbraPasswordLockoutFailureLifetime}
                background="gray5"
                selectName="zimbraPasswordLockoutFailureLifetime"
                onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
                onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutFailureLifetime')}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};
