/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Container,
  getFieldErrorProps,
  Input,
  ListRow,
  Padding,
  PasswordInput,
  Switch,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { DOMAIN_AUTH_VALIDATION_MESSAGES } from '../schema';
import type { DomainAuthenticationFormApi } from '../use-domain-auth-form';
import { AuthLdapFilterHelpIcon, AuthLdapUrlHelpIcon } from './auth-question-mark-icon';

type AuthLdapSectionProps = {
  form: DomainAuthenticationFormApi;
};

export const AuthLdapSection = ({ form }: AuthLdapSectionProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

  return (
    <>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapURL">
            {(field) => {
              const error = getFieldErrorProps(
                field,
                isSubmitted || field.state.meta.isTouched,
                t,
                DOMAIN_AUTH_VALIDATION_MESSAGES,
              );
              return (
                <>
                  <Input
                    isRequired
                    label={t('label.url', 'URL')}
                    value={field.state.value}
                    backgroundColor="gray5"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                      field.handleChange(e.target.value);
                    }}
                    onBlur={(): void => field.handleBlur()}
                    hasError={error.hasError}
                    CustomIcon={AuthLdapUrlHelpIcon}
                  />
                  {error.hasError && (
                    <Container
                      mainAlignment="flex-start"
                      crossAlignment="flex-start"
                      width="fill"
                    >
                      <Padding top="small">
                        <ds-text as="span" size="extrasmall" weight="regular" color="error">
                          {error.description}
                        </ds-text>
                      </Padding>
                    </Container>
                  )}
                </>
              );
            }}
          </form.Field>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapSearchFilter">
            {(field) => (
              <Input
                label={t('label.filter', 'Filter')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
                CustomIcon={AuthLdapFilterHelpIcon}
              />
            )}
          </form.Field>
        </Padding>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapSearchBase">
            {(field) => (
              <Input
                label={t('label.search_base', 'Basic Search')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapSearchBindDn">
            {(field) => (
              <Input
                label={t('domain.authentication.search_bind_user', 'Search Bind User')}
                value={field.state.value}
                backgroundColor="gray5"
                inputName="user"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Padding>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapSearchBindPassword">
            {(field) => (
              <PasswordInput
                label={t('domain.authentication.search_bind_password', 'Search Bind Password')}
                backgroundColor="gray5"
                inputName="zimbraQuotaWarnInterval"
                value={field.state.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapStartTlsEnabled">
            {(field) => (
              <Switch
                data-testid="enable-secure-connection"
                value={field.state.value}
                label={t(
                  'label.enable_secure_connection',
                  'Enable Secure Connection (StartTLS/SSL)',
                )}
                onClick={(): void => field.handleChange(!field.state.value)}
                iconColor="primary"
              />
            )}
          </form.Field>
        </Padding>
      </ListRow>
    </>
  );
};
