/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFieldApi } from '@tanstack/react-form';
import { type TFunction } from 'i18next';

import { COS_VALIDATION_MESSAGES } from '../schema';

type FieldErrorProps = {
  hasError: boolean;
  description?: string;
};

export function getFieldErrorProps(
  field: AnyFieldApi,
  isSubmitted: boolean,
  t: TFunction,
): FieldErrorProps {
  const { meta } = field.state;
  const showError = (meta.isBlurred || isSubmitted) && !meta.isValid;
  if (!showError) {
    return { hasError: false };
  }

  const firstError = meta.errors[0];
  const key = typeof firstError === 'string' ? firstError : firstError?.message;

  return {
    hasError: true,
    description: key ? t(key, COS_VALIDATION_MESSAGES[key] ?? key) : undefined,
  };
}
