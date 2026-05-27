/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow, Padding, Row, Switch } from '@zextras/ui-components';
import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { CosFormApi } from './cos-form-api';

type COSPasswordProps = {
  form: CosFormApi;
  readonlyCOS: boolean;
};

const COSPassword: FC<COSPasswordProps> = ({ form, readonlyCOS }) => {
  const [t] = useTranslation();
  const labels = {
    password: t('cos.password', 'Password'),
    externalAuthenticationMessage: t(
      'cos.password_set_to_use_external_authentication_information_msg',
      'These settings do not affect the passwords set by users in domains that are configured to use external authentication',
    ),
    preventChange: t(
      'cos.prevent_user_from_changing_password',
      'Prevent user from changing password',
    ),
    characters: {
      minimumUppercase: t('cos.minimum_upper_case_characters', 'Minimum upper case characters'),
      minimumLowercase: t('cos.minimum_lower_case_characters', 'Minimum lower case characters'),
      minimumNumeric: t('cos.minimum_numeric_chracters', 'Minimum numeric characters'),
    },
    length: {
      minimum: t('cos.minimum_password_length', 'Minimum password length'),
      maximum: t('cos.maximum_password_length', 'Maximum password length'),
    },
    age: {
      minimum: t('cos.minimum_password_age', 'Minimum password age (Days)'),
      maximum: t('cos.maximum_password_age', 'Maximum password age (Days)'),
    },
    minimumPunctuationSymbol: t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols'),
    minDigitsOrPuncs: t(
      'cos.minimum_numeric_characters_or_punctuation_symbols',
      'Minimum numeric characters or punctuation symbols',
    ),
    enforceHistory: t(
      'cos.minimum_number_of_unique_password_history',
      'Minimum number of unique passwords history',
    ),
    blockCommonEnabled: t('cos.reject_common_passwords', 'Reject common passwords'),
  };

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {labels.password}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
        <Container
          orientation="horizontal"
          width="99%"
          crossAlignment="center"
          mainAlignment="space-between"
          background={'#D3EBF8'}
          padding={{ top: 'large', bottom: 'large' }}
          style={{ borderRadius: '2px 2px 0px 0px' }}
        >
          <Row mainAlignment="flex-start">
            <Padding horizontal="small">
              <ds-icon
                icon="InfoOutline"
                color="primary"
                style={{ width: '1.25rem', height: '1.25rem' }}
              ></ds-icon>
            </Padding>
          </Row>
          <Row mainAlignment="flex-start" width="100%" padding={{ top: 'small', bottom: 'small' }}>
            <ds-text as="p" overflow="break-word">
              {labels.externalAuthenticationMessage}
            </ds-text>
          </Row>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start">
              <form.Field name="zimbraPasswordLocked">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    label={labels.preventChange}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <form.Field name="zimbraPasswordMinLength">
                {(field) => (
                  <Input
                    label={labels.length.minimum}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMinLength"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small', right: 'small' }}>
              <form.Field name="zimbraPasswordMaxLength">
                {(field) => (
                  <Input
                    label={labels.length.maximum}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMaxLength"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small', right: 'small' }}>
              <form.Field name="zimbraPasswordMinUpperCaseChars">
                {(field) => (
                  <Input
                    label={labels.characters.minimumUppercase}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMinUpperCaseChars"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraPasswordMinLowerCaseChars">
                {(field) => (
                  <Input
                    label={labels.characters.minimumLowercase}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMinLowerCaseChars"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <form.Field name="zimbraPasswordMinPunctuationChars">
                {(field) => (
                  <Input
                    label={labels.minimumPunctuationSymbol}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMinPunctuationChars"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small', right: 'small' }}>
              <form.Field name="zimbraPasswordMinNumericChars">
                {(field) => (
                  <Input
                    label={labels.characters.minimumNumeric}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMinNumericChars"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small', right: 'small' }}>
              <form.Field name="zimbraPasswordMinAge">
                {(field) => (
                  <Input
                    label={labels.age.minimum}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMinAge"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraPasswordMaxAge">
                {(field) => (
                  <Input
                    label={labels.age.maximum}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMaxAge"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <form.Field name="zimbraPasswordMinDigitsOrPuncs">
                {(field) => (
                  <Input
                    label={labels.minDigitsOrPuncs}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordMinDigitsOrPuncs"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraPasswordEnforceHistory">
                {(field) => (
                  <Input
                    label={labels.enforceHistory}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraPasswordEnforceHistory"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ bottom: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start" padding={{ top: 'large' }}>
              <form.Field name="zimbraPasswordBlockCommonEnabled">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    label={labels.blockCommonEnabled}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <ds-divider></ds-divider>
    </Row>
  );
};

export default COSPassword;
