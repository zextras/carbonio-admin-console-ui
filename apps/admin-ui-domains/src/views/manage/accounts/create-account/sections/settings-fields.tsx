/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { Select, type SelectItem, Switch } from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountStatus } from '../../../../utility/utils';
import { useCreateAccountFormContext } from '../create-account-form-context';

const EMPTY_SELECTION: SelectItem = { label: '', value: '' };

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
            label={t('label.account_status', 'Account Status')}
            selection={find(ACCOUNT_STATUS, { value: statusField.state.value }) ?? EMPTY_SELECTION}
            onChange={(value: string): void => {
              statusField.handleChange(value);
            }}
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
              label={t('label.default_class_of_service', 'Default Class of Service')}
              selection={find(cosItems, { value: cosField.state.value }) ?? EMPTY_SELECTION}
              onChange={(value: string): void => {
                cosField.handleChange(value);
              }}
              disabled={defaultCOSField.state.value}
            />
          )}
        </div>
      </div>
    </div>
  );
};
