/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { Select, Switch } from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountStatus } from '../../../../utility/utils';
import { useCreateAccountFormContext } from '../create-account-form-context';

export const SettingsFields = (): ReactElement => {
  const [t] = useTranslation();
  const { form } = useCreateAccountFormContext();

  const statusField = useField({ form, name: 'zimbraAccountStatus' });
  const cosField = useField({ form, name: 'zimbraCOSId' });
  const defaultCOSField = useField({ form, name: 'defaultCOS' });

  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosItems = (cosData?.cos ?? []).map((item: { name: string; id: string }) => ({
    label: item.name,
    value: item.id,
  }));

  const ACCOUNT_STATUS = AccountStatus(t);

  return (
    <div className="flex w-full flex-wrap justify-start pt-lg pl-sm">
      <div className="flex flex-wrap justify-center pt-lg">
        <ds-text size="small" color="gray0" weight="bold" as="h2">
          Settings
        </ds-text>
      </div>
      <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
        <div className="flex w-full flex-wrap justify-start">
          <Select
            items={ACCOUNT_STATUS}
            background="gray5"
            label={t('label.account_status', 'Account Status')}
            showCheckbox={false}
            onChange={(v: string | null): void => {
              statusField.handleChange(v ?? '');
            }}
            defaultSelection={find(ACCOUNT_STATUS, { value: statusField.state.value })}
          />
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between pt-lg pl-lg">
        <div className="flex w-[20%] flex-wrap justify-start">
          <Switch
            value={defaultCOSField.state.value}
            onClick={(): void => {
              defaultCOSField.handleChange(!defaultCOSField.state.value);
            }}
            label={t('accountDetails.default_COS', 'Default COS')}
            iconColor="primary"
          />
        </div>
        <div className="flex w-[80%] flex-wrap justify-start">
          {cosItems.length > 0 && (
            <Select
              items={cosItems}
              background="gray5"
              label={t('label.default_class_of_service', 'Default Class of Service')}
              showCheckbox={false}
              defaultSelection={find(cosItems, { value: cosField.state.value })}
              onChange={(v: string | null): void => {
                cosField.handleChange(v ?? '');
              }}
              disabled={defaultCOSField.state.value}
            />
          )}
        </div>
      </div>
    </div>
  );
};
