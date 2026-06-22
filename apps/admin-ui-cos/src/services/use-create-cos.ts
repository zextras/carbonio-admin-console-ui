/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { Attribute } from '../../types/attribute';
import { CosResponse } from '../../types/cos';
import { cosQueryKeys } from './cos-query-keys';
import { createCos } from './create-cos';

type CreateCosVariables = {
  name: string;
  attributes?: Array<Attribute>;
};

export function useCreateCos() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<CosResponse, Error, CreateCosVariables>({
    mutationFn: ({ name, attributes }) => createCos(name, attributes),
    onSuccess: async (_data, { name }) => {
      await queryClient.invalidateQueries({ queryKey: cosQueryKeys.all });
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.create_cos_success_msg', {
          cosName: name,
          defaultValue: '{{cosName}} has been created successfully',
        }),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    onError: (error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          error?.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
