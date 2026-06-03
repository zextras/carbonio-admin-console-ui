/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Container, Input, ListRow, Select } from '@zextras/ui-components';
import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { AccountType } from '../../../../../types/account';
import type { TimeItems } from '../../../../../types/general';
import { getFieldErrorProps } from './field-error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CosFormApi = ReactFormExtendedApi<
  AccountType & { backupEnabled: boolean; backupSelfUndeleteAllowed: boolean },
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

type TimeFieldGroupProps = {
  form: CosFormApi;
  name: keyof AccountType;
  label: string;
  readonlyCOS: boolean;
  timeItems: TimeItems;
  disabled?: boolean;
};

export const TimeFieldGroup: FC<TimeFieldGroupProps> = ({
  form,
  name,
  label,
  readonlyCOS,
  timeItems,
  disabled,
}) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  return (
    <form.Field name={name}>
      {(field) => {
        const raw = String(field.state.value ?? '');
        const hasUnit = raw.length >= 2;
        const num = hasUnit ? raw.slice(0, -1) : '';
        const unit = hasUnit ? raw.slice(-1) : '';
        const isDisabled = disabled || readonlyCOS;
        const error = getFieldErrorProps(field, isSubmitted, t);
        return (
          <ListRow>
            <Container width="83%" crossAlignment="flex-start" padding={{ right: 'small' }}>
              <Input
                label={label}
                value={num}
                backgroundColor="gray5"
                inputName={String(name)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value;
                  field.handleChange(v ? `${v}${unit}` : '');
                }}
                onBlur={() => field.handleBlur()}
                hasError={error.hasError}
                description={error.description}
                disabled={isDisabled}
              />
            </Container>
            <Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
              <Select
                items={timeItems}
                background="gray5"
                label={t('cos.time_range', 'Time Range')}
                selection={timeItems.find((item) => item.value === unit) ?? timeItems[0]}
                showCheckbox={false}
                onChange={(newUnit) => {
                  if (newUnit) field.handleChange(num ? `${num}${newUnit}` : '');
                }}
                disabled={isDisabled}
              />
            </Container>
          </ListRow>
        );
      }}
    </form.Field>
  );
};
