/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  InheritedSwitch,
  ListRow,
  Row,
  Select,
  TextInput,
} from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isInheritedOverridden } from '../../utility/is-inherited-overridden';
import { RevertToInheritedIcon } from '../../utility/revert-to-inherited-icon';
import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';

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

  const lockoutDurationValue = values.zimbraPasswordLockoutDuration as string | undefined;
  const lockoutDurationInherited = cosDetail.zimbraPasswordLockoutDuration as string | undefined;
  const lockoutFailureLifetimeValue = values.zimbraPasswordLockoutFailureLifetime as
    | string
    | undefined;
  const lockoutFailureLifetimeInherited = cosDetail.zimbraPasswordLockoutFailureLifetime as
    | string
    | undefined;

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  const onZimbraPasswordLockoutDurationTypeChange = (v: string) => {
    const num =
      (lockoutDurationValue ?? lockoutDurationInherited ?? '').slice(0, -1) ||
      zimbraPasswordLockoutDurationNum;
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPasswordLockoutDuration: num ? `${num}${v}` : '',
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
    const num =
      (lockoutFailureLifetimeValue ?? lockoutFailureLifetimeInherited ?? '').slice(0, -1) ||
      zimbraPasswordLockoutFailureLifetimeNum;
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPasswordLockoutFailureLifetime: num ? `${num}${v}` : '',
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

  const timeItems: Array<{ label: string; value: string }> = [
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

  const inheritedDescription = t(
    'label.inherited_from_cos',
    'Inherited from the Class of Service',
  );
  const revertLabel = t('label.click_to_revert', 'Click to revert to the inherited value');

  const lockoutMaxFailuresValue = values.zimbraPasswordLockoutMaxFailures as string | undefined;
  const lockoutMaxFailuresInherited = cosDetail.zimbraPasswordLockoutMaxFailures as
    | string
    | undefined;
  const isLockoutMaxFailuresOverridden = isInheritedOverridden(
    lockoutMaxFailuresValue,
    accSpecificDetail?.zimbraPasswordLockoutMaxFailures as string | undefined,
    lockoutMaxFailuresInherited,
  );

  const isLockoutDurationOverridden = isInheritedOverridden(
    lockoutDurationValue,
    accSpecificDetail?.zimbraPasswordLockoutDuration as string | undefined,
    lockoutDurationInherited,
  );

  const isLockoutFailureLifetimeOverridden = isInheritedOverridden(
    lockoutFailureLifetimeValue,
    accSpecificDetail?.zimbraPasswordLockoutFailureLifetime as string | undefined,
    lockoutFailureLifetimeInherited,
  );

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
              <TextInput
                required
                label={t(
                  'cos.number_of_consecutive_failed_login_allowed',
                  'Number of consecutive failed logins allowed',
                )}
                name="zimbraPasswordLockoutMaxFailures"
                autoComplete="off"
                value={lockoutMaxFailuresValue ?? lockoutMaxFailuresInherited ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAccountValues((prev: Record<string, any>) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }));
                }}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                description={
                  isLockoutMaxFailuresOverridden ? undefined : inheritedDescription
                }
                icon={
                  isLockoutMaxFailuresOverridden ? (
                    <RevertToInheritedIcon
                      label={revertLabel}
                      onClick={(): void => setEmptyValue('zimbraPasswordLockoutMaxFailures')}
                    />
                  ) : undefined
                }
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
              <TextInput
                required
                label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
                name="zimbraPasswordLockoutDuration"
                autoComplete="off"
                value={
                  lockoutDurationValue?.slice(0, -1) ??
                  lockoutDurationInherited?.slice(0, -1) ??
                  ''
                }
                onChange={onZimbraPasswordLockoutDurationNumChange}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                description={isLockoutDurationOverridden ? undefined : inheritedDescription}
                icon={
                  isLockoutDurationOverridden ? (
                    <RevertToInheritedIcon
                      label={revertLabel}
                      onClick={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
                    />
                  ) : undefined
                }
              />
            </Container>
            <Container width="25%" padding={{ left: 'small' }}>
              <Select
                label={t('cos.time_range', 'Time Range')}
                items={timeItems}
                selection={
                  timeItems.find((item) => item.value === lockoutDurationValue?.slice(-1)) ??
                  timeItems.find((item) => item.value === lockoutDurationInherited?.slice(-1)) ??
                  timeItems[0]
                }
                onChange={onZimbraPasswordLockoutDurationTypeChange}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                description={isLockoutDurationOverridden ? undefined : inheritedDescription}
                icon={
                  isLockoutDurationOverridden ? (
                    <RevertToInheritedIcon
                      label={revertLabel}
                      onClick={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
                    />
                  ) : undefined
                }
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
              <TextInput
                required
                label={t(
                  'cos.time_window_failed_logins_must_occur_to_lock_account',
                  'Time window in which the failed logins must occur to lock the account:',
                )}
                name="zimbraPasswordLockoutFailureLifetime"
                autoComplete="off"
                value={
                  lockoutFailureLifetimeValue?.slice(0, -1) ??
                  lockoutFailureLifetimeInherited?.slice(0, -1) ??
                  ''
                }
                onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                description={
                  isLockoutFailureLifetimeOverridden ? undefined : inheritedDescription
                }
                icon={
                  isLockoutFailureLifetimeOverridden ? (
                    <RevertToInheritedIcon
                      label={revertLabel}
                      onClick={(): void => setEmptyValue('zimbraPasswordLockoutFailureLifetime')}
                    />
                  ) : undefined
                }
              />
            </Container>
            <Container width="25%" padding={{ left: 'small' }}>
              <Select
                label={t('cos.time_range', 'Time Range')}
                items={timeItems}
                selection={
                  timeItems.find(
                    (item) => item.value === lockoutFailureLifetimeValue?.slice(-1),
                  ) ??
                  timeItems.find(
                    (item) => item.value === lockoutFailureLifetimeInherited?.slice(-1),
                  ) ??
                  timeItems[0]
                }
                onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
                disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                description={
                  isLockoutFailureLifetimeOverridden ? undefined : inheritedDescription
                }
                icon={
                  isLockoutFailureLifetimeOverridden ? (
                    <RevertToInheritedIcon
                      label={revertLabel}
                      onClick={(): void => setEmptyValue('zimbraPasswordLockoutFailureLifetime')}
                    />
                  ) : undefined
                }
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};
