/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, ListRow, Row, Select, Switch } from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DISABLED, ENABLED } from '../../../constants';
import { isValidEmail } from '../../utility/utils';
import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';

export const ForgottenPassword = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const [t] = useTranslation();
  const [recoveryEmailError, setRecoveryEmailError] = useState<boolean>(false);

  const changeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onRecoveryStatusChange = (v: unknown): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefPasswordRecoveryAddressStatus: v,
    }));
  };

  const recoveryStatus: any[] = [
    {
      label: t('label.pending', 'Pending'),
      value: 'pending',
    },
    {
      label: t('label.verified', 'Verified'),
      value: 'verified',
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
        {t('label.forgotten_password', 'Forgotten Password')}
      </ds-text>
      <Row mainAlignment="center" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start" width="30%" padding={{ right: 'small' }}>
              <Switch
                value={values?.zimbraFeatureResetPasswordStatus === 'enabled'}
                onClick={(): void =>
                  toggleAccountValue('zimbraFeatureResetPasswordStatus', ENABLED, DISABLED)
                }
                label={t(
                  'label.user_can_ask_for_forgotten_password_token',
                  'User can ask for a forgotten password token',
                )}
                iconColor="primary"
              />
            </Container>
            <Container width="40%" padding={{ right: 'small', left: 'small' }}>
              <Input
                backgroundColor="gray5"
                label={t('label.user_recovery_email', 'User Recovery Email')}
                value={values?.zimbraPrefPasswordRecoveryAddress || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  if (isValidEmail(e?.target?.value)) {
                    changeValue(e);
                    setRecoveryEmailError(false);
                  } else {
                    setRecoveryEmailError(true);
                  }
                }}
                inputName="zimbraPrefPasswordRecoveryAddress"
                description={t(
                  'label.enter_valid_email_address',
                  'Enter valid email Address',
                )}
                hasError={recoveryEmailError}
              />
            </Container>
            <Container width="30%" padding={{ left: 'small' }}>
              <Select
                items={recoveryStatus}
                background="gray5"
                label={t('label.status', 'Status')}
                showCheckbox={false}
                onChange={onRecoveryStatusChange}
                defaultSelection={recoveryStatus.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) =>
                    item.value === values?.zimbraPrefPasswordRecoveryAddressStatus,
                )}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};
