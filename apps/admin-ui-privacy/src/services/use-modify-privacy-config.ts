/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import {
  modifyPrivacyConfig,
  type ModifyPrivacyConfigInput,
} from './modify-privacy-config';

export function useModifyPrivacyConfig() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, ModifyPrivacyConfigInput>({
    mutationFn: (value: ModifyPrivacyConfigInput) => modifyPrivacyConfig(value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['all-config'] });
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.change_save_success_msg', 'The change has been saved successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    onError: (error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: error?.message
          ? error.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
