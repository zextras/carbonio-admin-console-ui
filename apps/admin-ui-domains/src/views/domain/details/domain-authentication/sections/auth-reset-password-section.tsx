/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow, Padding, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { DomainAuthenticationFormApi } from '../use-domain-auth-form';

type AuthResetPasswordSectionProps = {
  form: DomainAuthenticationFormApi;
};

export const AuthResetPasswordSection = ({ form }: AuthResetPasswordSectionProps) => {
  const [t] = useTranslation();

  return (
    <ListRow>
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
    </ListRow>
  );
};
