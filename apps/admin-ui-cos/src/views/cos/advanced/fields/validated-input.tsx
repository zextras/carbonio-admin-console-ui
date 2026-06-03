/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Input } from '@zextras/ui-components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { AccountType } from '../../../../../types/account';
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

type CosValidatedInputProps = {
  form: CosFormApi;
  name: keyof AccountType;
  label: string;
  disabled?: boolean;
};

export const CosValidatedInput = ({
  form,
  name,
  label,
  disabled = false,
}: CosValidatedInputProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

  return (
    <form.Field name={name}>
      {(field) => {
        const error = getFieldErrorProps(field, isSubmitted, t);
        return (
          <Input
            label={label}
            value={field.state.value ?? ''}
            backgroundColor="gray5"
            inputName={String(name)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
            onBlur={() => field.handleBlur()}
            hasError={error.hasError}
            description={error.description}
            disabled={disabled}
          />
        );
      }}
    </form.Field>
  );
};
