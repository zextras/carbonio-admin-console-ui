/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Input, ListRow, Padding, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { isValidLdapBaseUrl } from '../../../utility/utils';
import type { DomainAuthenticationFormApi } from '../use-domain-auth-form';

type AuthOptionsSectionProps = {
  form: DomainAuthenticationFormApi;
  isAdvanced: boolean;
};

export const AuthOptionsSection = ({ form, isAdvanced }: AuthOptionsSectionProps) => {
  const [t] = useTranslation();
  const ldapUrl = useSelector(form.store, (s) => s.values.zimbraAuthLdapURL);
  const canEnforceExternalAuth = isValidLdapBaseUrl(ldapUrl);

  return (
    <>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <ds-divider></ds-divider>
        </Padding>
      </ListRow>
      <ListRow>
        {isAdvanced && (
          <Padding vertical="small" horizontal="small" width="70%">
            <form.Field name="zimbraFeatureResetPasswordStatus">
              {(field) => (
                <Switch
                  data-testid="reset-password-switch"
                  value={field.state.value}
                  label={t(
                    'label.show_forget_password_link',
                    'Show "Forget Password" link in the login page',
                  )}
                  onClick={(): void => field.handleChange(!field.state.value)}
                  iconColor="primary"
                />
              )}
            </form.Field>
          </Padding>
        )}
        <Padding vertical="small" horizontal="small" width="100%">
          <Tooltip
            label={
              canEnforceExternalAuth
                ? t(
                    'label.enable_global_enforce_external_auth_ldap',
                    'You must enable the Global Enforce External Auth (LDAP/AD) first',
                  )
                : t(
                    'label.please_add_ldap_url_endpoint_first',
                    'To enable this, please add a ldap URL endpoint first',
                  )
            }
            disabled={canEnforceExternalAuth}
          >
            <form.Field name="zimbraAuthFallbackToLocal">
              {(field) => (
                <Switch
                  value={field.state.value && canEnforceExternalAuth}
                  label={t('label.enforce_external_auth', 'Enforce External Auth (LDAP/AD)')}
                  onClick={(): void => {
                    if (!canEnforceExternalAuth) return;
                    field.handleChange(!field.state.value);
                  }}
                  iconColor="primary"
                  disabled={!canEnforceExternalAuth}
                />
              )}
            </form.Field>
          </Tooltip>
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
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <form.Field name="zimbraPasswordChangeListener">
            {(field) => (
              <Input
                label={t(
                  'label.external_password_change_listener',
                  'Endpoint to be used for password change',
                )}
                backgroundColor="gray5"
                value={field.state.value}
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
