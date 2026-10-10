/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { ListRow, Padding, Select } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

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
  const selected = items.find((item) => item.value === authMech) ?? items[0];

  function handleAuthMethodChange(value: string): void {
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
            label={t('label.your_auth_method_is', 'Your Auth Method is')}
            items={items}
            selection={selected}
            onChange={handleAuthMethodChange}
          />
          <Padding top="medium">
            <ds-text as="p" size="small" color="gray1">
              {isAdvanced ? selected.info_label : selected.info_label_ce}
            </ds-text>
          </Padding>
        </Padding>
      </ListRow>
    </>
  );
};
