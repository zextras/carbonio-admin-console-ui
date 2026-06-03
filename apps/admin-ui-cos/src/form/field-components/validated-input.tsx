/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Input } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useFieldContext } from '../form-context';
import { getFieldErrorProps } from './field-error';

type ValidatedInputProps = {
  label: string;
  disabled?: boolean;
};

export const ValidatedInput = ({ label, disabled = false }: ValidatedInputProps) => {
  const [t] = useTranslation();
  const field = useFieldContext<string>();
  const isSubmitted = useSelector(field.form.store, (s) => s.submissionAttempts > 0);
  const error = getFieldErrorProps(field, isSubmitted, t);

  return (
    <Input
      label={label}
      value={field.state.value ?? ''}
      backgroundColor="gray5"
      inputName={String(field.name)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
      onBlur={() => field.handleBlur()}
      hasError={error.hasError}
      description={error.description}
      disabled={disabled}
    />
  );
};
