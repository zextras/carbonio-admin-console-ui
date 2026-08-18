/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';

import { restoreAccountSchema } from './schema';
import type { RestoreFormValues } from './types';

export function useRestoreForm(
  defaultValues: RestoreFormValues,
  onSubmit: (value: RestoreFormValues) => void,
) {
  return useForm({
    defaultValues,
    validators: {
      onChange: restoreAccountSchema,
      onSubmit: restoreAccountSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });
}
