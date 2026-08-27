/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  InheritedInput,
  InheritedSwitch,
  ListRow,
  Padding,
  Row,
} from '@zextras/ui-components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';

type InheritedInputFieldProps = {
  readonly label: string;
  readonly inputName: string;
  readonly values: Record<string, any>;
  readonly cosDetail: Record<string, any>;
  readonly accSpecificDetail: Record<string, any>;
  readonly changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly setEmptyValue: (keyName: string) => void;
};

function InheritedPolicyInput({
  label,
  inputName,
  values,
  cosDetail,
  accSpecificDetail,
  changeValue,
  setEmptyValue,
}: InheritedInputFieldProps) {
  return (
    <InheritedInput
      isRequired
      label={label}
      subValue={values[inputName]}
      inheritedValue={cosDetail[inputName]}
      fromSubValue={accSpecificDetail?.[inputName]}
      background="gray5"
      inputName={inputName}
      onChange={changeValue}
      onChangeReset={(): void => setEmptyValue(inputName)}
    />
  );
}

export const PasswordPolicies = () => {
  const { form, accSpecificDetail, cosDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const [t] = useTranslation();

  const changeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  const fieldProps = {
    values,
    cosDetail,
    accSpecificDetail,
    changeValue,
    setEmptyValue,
  };

  return (
    <>
      <Row mainAlignment="flex-start" width="100%">
        <Row
          mainAlignment="flex-start"
          width="100%"
          padding={{ top: 'large', left: 'large', right: 'large' }}
        >
          <Container
            orientation="horizontal"
            width="100%"
            crossAlignment="center"
            mainAlignment="space-between"
            background="#D3EBF8"
            padding={{
              all: 'large',
            }}
            style={{ borderRadius: '2px 2px 0px 0px' }}
          >
            <Row mainAlignment="flex-start">
              <Padding horizontal="small">
                <ds-icon
                  icon="InfoOutline"
                  color="primary"
                  style={{ width: '20px', height: '20px' }}
                ></ds-icon>
              </Padding>
            </Row>
            <Row
              mainAlignment="flex-start"
              width="100%"
              padding={{
                all: 'small',
              }}
            >
              <ds-text as="p" overflow="break-word">
                {t(
                  'label.account_password_setting_note_for_external_authentication',
                  'The settings below ↓ do not affect the passwords set by users in domains that are configured to use external authentication. Changes made here will override COS settings for the password and the failed login lockout.',
                )}
              </ds-text>
            </Row>
          </Container>
        </Row>
      </Row>
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ all: 'large' }}
        width="100%"
      >
        <ds-text as="h2" weight="bold">
          {t('cos.password', 'Password')}
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
                  subValue={values?.zimbraPasswordLocked}
                  onChange={toggleAccountValue}
                  label={t(
                    'cos.prevent_user_from_changing_password',
                    'Prevent user from changing password',
                  )}
                  iconColor="primary"
                  inheritedValue={cosDetail.zimbraPasswordLocked}
                  fromSubValue={accSpecificDetail?.zimbraPasswordLocked}
                  inputName={'zimbraPasswordLocked'}
                  onChangeReset={(): void => setEmptyValue('zimbraPasswordLocked')}
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
              <Container padding={{ right: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t('cos.minimum_password_length', 'Minimum password length')}
                  inputName="zimbraPasswordMinLength"
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t('cos.maximum_password_length', 'Maximum password length')}
                  inputName="zimbraPasswordMaxLength"
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
              <Container padding={{ right: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t(
                    'cos.minimum_upper_case_characters',
                    'Minimum upper case characters',
                  )}
                  inputName="zimbraPasswordMinUpperCaseChars"
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t(
                    'cos.minimum_lower_case_characters',
                    'Minimum lower case characters',
                  )}
                  inputName="zimbraPasswordMinLowerCaseChars"
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
              <Container padding={{ right: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols')}
                  inputName="zimbraPasswordMinPunctuationChars"
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
                  inputName="zimbraPasswordMinNumericChars"
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
              <Container padding={{ right: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
                  inputName="zimbraPasswordMinAge"
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t('cos.maximum_password_age', 'Maximum password age (Days)')}
                  inputName="zimbraPasswordMaxAge"
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
              <Container padding={{ right: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t(
                    'cos.minimum_numeric_characters_or_punctuation_symbols',
                    'Minimum numeric characters or punctuation symbols',
                  )}
                  inputName="zimbraPasswordMinDigitsOrPuncs"
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <InheritedPolicyInput
                  {...fieldProps}
                  label={t(
                    'cos.minimum_number_of_unique_password_history',
                    'Minimum number of unique passwords history',
                  )}
                  inputName="zimbraPasswordEnforceHistory"
                />
              </Container>
            </ListRow>
          </Container>
        </Row>
        <Row mainAlignment="flex-start" width="100%">
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <ListRow>
              <Container crossAlignment="flex-start" padding={{ top: 'large' }}>
                <InheritedSwitch
                  subValue={values?.zimbraPasswordBlockCommonEnabled}
                  onChange={toggleAccountValue}
                  label={t('cos.reject_common_passwords', 'Reject common passwords')}
                  iconColor="primary"
                  inheritedValue={cosDetail.zimbraPasswordBlockCommonEnabled}
                  fromSubValue={accSpecificDetail?.zimbraPasswordBlockCommonEnabled}
                  inputName={'zimbraPasswordBlockCommonEnabled'}
                  onChangeReset={(): void => setEmptyValue('zimbraPasswordBlockCommonEnabled')}
                />
              </Container>
            </ListRow>
          </Container>
        </Row>
      </Row>
    </>
  );
};
