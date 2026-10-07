/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  getFieldErrorProps,
  ListRow,
  Padding,
  PasswordInput,
  PlainInput,
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
                <PlainInput
                  required
                  label={t('label.url', 'URL')}
                  value={field.state.value ?? ''}
                  autoComplete="off"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    field.handleChange(e.target.value);
                  }}
                  onBlur={(): void => field.handleBlur()}
                  hasError={error.hasError}
                  description={error.description}
                  icon={<AuthLdapUrlHelpIcon />}
                />
              );
            }}
          </form.Field>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapSearchFilter">
            {(field) => (
              <PlainInput
                label={t('label.filter', 'Filter')}
                value={field.state.value ?? ''}
                autoComplete="off"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
                icon={<AuthLdapFilterHelpIcon />}
              />
            )}
          </form.Field>
        </Padding>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraAuthLdapSearchBase">
            {(field) => (
              <PlainInput
                label={t('label.search_base', 'Basic Search')}
                value={field.state.value ?? ''}
                autoComplete="off"
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
              <PlainInput
                label={t('domain.authentication.search_bind_user', 'Search Bind User')}
                value={field.state.value ?? ''}
                name="searchBindUser"
                autoComplete="off"
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
                name="zimbraAuthLdapSearchBindPassword"
                autoComplete="new-password"
                value={field.state.value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Padding>
      </ListRow>
    </>
  );
};
