/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Padding, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosAdvancedFormValues } from '../types';

export default withForm({
  defaultValues: {} as CosAdvancedFormValues,
  props: { readonlyCOS: false as boolean },
  render: function Render({ form, readonlyCOS }) {
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
            background={'var(--color-info-banner)'}
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
                <form.AppField name="zimbraPasswordMinLength">
                  {(field) => (
                    <field.ValidatedInput label={labels.length.minimum} disabled={readonlyCOS} />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small', right: 'small' }}>
                <form.AppField name="zimbraPasswordMaxLength">
                  {(field) => (
                    <field.ValidatedInput label={labels.length.maximum} disabled={readonlyCOS} />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small', right: 'small' }}>
                <form.AppField name="zimbraPasswordMinUpperCaseChars">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.characters.minimumUppercase}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small' }}>
                <form.AppField name="zimbraPasswordMinLowerCaseChars">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.characters.minimumLowercase}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
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
                <form.AppField name="zimbraPasswordMinPunctuationChars">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.minimumPunctuationSymbol}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small', right: 'small' }}>
                <form.AppField name="zimbraPasswordMinNumericChars">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.characters.minimumNumeric}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small', right: 'small' }}>
                <form.AppField name="zimbraPasswordMinAge">
                  {(field) => (
                    <field.ValidatedInput label={labels.age.minimum} disabled={readonlyCOS} />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small' }}>
                <form.AppField name="zimbraPasswordMaxAge">
                  {(field) => (
                    <field.ValidatedInput label={labels.age.maximum} disabled={readonlyCOS} />
                  )}
                </form.AppField>
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
                <form.AppField name="zimbraPasswordMinDigitsOrPuncs">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.minDigitsOrPuncs}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small' }}>
                <form.AppField name="zimbraPasswordEnforceHistory">
                  {(field) => (
                    <field.ValidatedInput label={labels.enforceHistory} disabled={readonlyCOS} />
                  )}
                </form.AppField>
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
  },
});
