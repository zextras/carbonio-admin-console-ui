/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Button, Input, ListRow, Padding, PasswordInput } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../../../../constants';
import { useCheckAuthConfig } from '../../../../services/use-check-auth-config';
import { isValidLdapBaseUrl } from '../../../utility/utils';
import { isExternalAuth } from '../schema';
import type { DomainAuthenticationFormApi } from '../use-domain-auth-form';

type AuthVerifySectionProps = {
  form: DomainAuthenticationFormApi;
};

export const AuthVerifySection = ({ form }: AuthVerifySectionProps) => {
  const [t] = useTranslation();
  const checkAuthMutation = useCheckAuthConfig();
  const [verifyUserName, setVerifyUserName] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const authMech = useSelector(form.store, (s) => s.values.zimbraAuthMech);
  const ldapUrl = useSelector(form.store, (s) => s.values.zimbraAuthLdapURL);
  const bindDn = useSelector(form.store, (s) => s.values.zimbraAuthLdapSearchBindDn);
  const bindPassword = useSelector(form.store, (s) => s.values.zimbraAuthLdapSearchBindPassword);
  const searchFilter = useSelector(form.store, (s) => s.values.zimbraAuthLdapSearchFilter);

  const canVerify =
    isExternalAuth(authMech) &&
    ldapUrl !== '' &&
    isValidLdapBaseUrl(ldapUrl) &&
    bindDn !== '' &&
    bindPassword !== '';

  function handleVerify(): void {
    checkAuthMutation.mutate(
      {
        _jsns: ZIMBRA_ADMIN_URN,
        name: verifyUserName,
        password: verifyPassword,
        a: [
          { n: 'zimbraAuthMech', _content: authMech },
          { n: 'zimbraAuthLdapURL', _content: ldapUrl },
          { n: 'zimbraAuthLdapSearchFilter', _content: searchFilter },
          { n: 'zimbraAuthLdapSearchBindDn', _content: bindDn },
          { n: 'zimbraAuthLdapSearchBindPassword', _content: bindPassword },
        ],
      },
      {
        onSuccess: () => {
          setIsVerified(true);
        },
        onError: () => {
          setIsVerified(false);
        },
      },
    );
  }

  return (
    <>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="100%">
          <ds-divider></ds-divider>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding vertical="large" horizontal="small" width="100%">
          <ds-text as="h3" size="small" color="gray0" weight="bold">
            {t('label.verify_auth', 'Verify Auth')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding vertical="small" horizontal="small" width="38%">
          <Input
            label={t('label.user_name', 'User Name')}
            value={verifyUserName}
            backgroundColor="gray5"
            inputName="verifyAuthUser"
            autoComplete="new-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setVerifyUserName(e.target.value);
              setIsVerified(false);
            }}
          />
        </Padding>
        <Padding vertical="small" horizontal="small" width="38%">
          <PasswordInput
            label={t('label.password', 'Password')}
            backgroundColor="gray5"
            inputName="verifyAuthPassword"
            autoComplete="new-password"
            value={verifyPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setVerifyPassword(e.target.value);
              setIsVerified(false);
            }}
          />
        </Padding>
        <Padding vertical="small" horizontal="small" width="24%">
          <Button
            type="outlined"
            label={
              isVerified
                ? t('label.login_verified_button_title', 'LOGIN VERIFIED')
                : t('label.login_verify_button_title', 'LOGIN AND VERIFY')
            }
            icon="CheckmarkOutline"
            iconPlacement="right"
            color={isVerified ? 'success' : 'primary'}
            width="fill"
            size="extralarge"
            onClick={(e): void => {
              e.preventDefault();
              handleVerify();
            }}
            disabled={!canVerify || checkAuthMutation.isPending}
          />
        </Padding>
      </ListRow>
    </>
  );
};
