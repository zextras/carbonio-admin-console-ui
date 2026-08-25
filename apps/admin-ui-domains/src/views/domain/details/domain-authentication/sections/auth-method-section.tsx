/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Input,
  ListRow,
  Padding,
  Select,
  type SelectItem,
  Switch,
  Tooltip,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { isValidLdapBaseUrl } from '../../../../utility/utils';
import type { DomainAuthenticationFormApi } from '../use-domain-auth-form';
import { getAuthMethodItems } from '../utils';

type AuthMethodSectionProps = {
  form: DomainAuthenticationFormApi;
  isAdvanced: boolean;
};

export const AuthMethodSection = ({ form, isAdvanced }: AuthMethodSectionProps) => {
  const [t] = useTranslation();
  const items = getAuthMethodItems(t);
  const authMech = useSelector(form.store, (s) => s.values.zimbraAuthMech);
  const ldapUrl = useSelector(form.store, (s) => s.values.zimbraAuthLdapURL);
  const selected = items.find((item) => item.value === authMech) ?? items[0];
  const canEnforceExternalAuth = isValidLdapBaseUrl(ldapUrl);

  function handleAuthMethodChange(value: Array<SelectItem> | string | null): void {
    if (typeof value !== 'string') return;
    form.setFieldValue('zimbraAuthMech', value);
  }

  return (
    <>
      <ListRow>
        <Padding vertical="large" horizontal="small" width="100%">
          <ds-text as="h3" size="small" color="gray0" weight="bold">
            {t('label.auth_method', 'Auth Method')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <Select
            data-testid="auth-method-select"
            background="gray5"
            label={t('label.your_auth_method_is', 'Your Auth Method is')}
            showCheckbox={false}
            items={items}
            selection={selected}
            onChange={handleAuthMethodChange}
          ></Select>
          <Padding top="medium">
            <ds-text as="p" size="small" color="gray1">
              {isAdvanced ? selected.info_label : selected.info_label_ce}
            </ds-text>
          </Padding>
        </Padding>
      </ListRow>
      <ListRow>
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
