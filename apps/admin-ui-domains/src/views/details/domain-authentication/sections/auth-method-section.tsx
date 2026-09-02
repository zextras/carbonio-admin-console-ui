/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { ListRow, Padding, Select, type SelectItem } from '@zextras/ui-components';
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
    </>
  );
};
